// Copyright 2017-2025 @polkadot/react-api authors & contributors
// SPDX-License-Identifier: Apache-2.0

// SInce this file is deemed deprecated (and awaiting removal), we just don't care

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { ApiProps, CallState as State, OnChangeCb, SubtractProps } from '../types.js';
import type { Options } from './types.js';

import React from 'react';

import { assert, isNull, isUndefined, nextTick } from '@polkadot/util';

import echoTransform from '../transform/echo.js';
import { isEqual, triggerChange } from '../util/index.js';
import withApi from './api.js';

// FIXME This is not correct, we need some junction of derive, query & consts
interface Method {
  (...params: unknown[]): Promise<any>;
  at: (hash: Uint8Array | string, ...params: unknown[]) => Promise<any>;
  meta: any;
  multi: (params: unknown[], cb: (value?: any) => void) => Promise<any>;
}

type ApiMethodInfo = [Method, unknown[], string];

const NOOP = (): void => {
  // ignore
};

const NO_SKIP = (): boolean => false;

// a mapping of actual error messages that has already been shown
const errorred: Record<string, boolean> = {};

export default function withCall<P extends ApiProps> (endpoint: string, { at, atProp, callOnResult, fallbacks, isMulti = false, paramName, paramPick, paramValid = false, params = [], propName, skipIf = NO_SKIP, transform = echoTransform, withIndicator = false }: Options = {}): (Inner: React.ComponentType<ApiProps>) => React.ComponentType<any> {
  return (Inner: React.ComponentType<ApiProps>): React.ComponentType<SubtractProps<P, ApiProps>> => {
    class WithPromise extends React.Component<P, State> {
      public override state: State = {
        callResult: undefined,
        callUpdated: false,
        callUpdatedAt: 0
      };

      private destroy?: () => void;

      private isActive = false;

      private propName: string;

      private timerId = -1;

      constructor (props: P) {
        super(props);

        const [, section, method] = endpoint.split('.');

        this.propName = `${section}_${method}`;
      }

      public override componentDidUpdate (prevProps: any): void {
        const oldParams = this.getParams(prevProps);
        const newParams = this.getParams(this.props);

        if (this.isActive && !isEqual(newParams, oldParams)) {
          this
            .subscribe(newParams)
            .then(NOOP)
            .catch(NOOP);
        }
      }

      public override componentDidMount (): void {
        this.isActive = true;

        if (withIndicator) {
          this.timerId = window.setInterval((): void => {
            const elapsed = Date.now() - (this.state.callUpdatedAt || 0);
            const callUpdated = elapsed <= 1500;

            if (callUpdated !== this.state.callUpdated) {
              this.nextState({ callUpdated });
            }
          }, 500);
        }

        // The attachment takes time when a lot is available, set a timeout
        // to first handle the current queue before subscribing
        nextTick((): void => {
          this
            .subscribe(this.getParams(this.props))
            .then(NOOP)
            .catch(NOOP);
        });
      }

      public override componentWillUnmount (): void {
        this.isActive = false;

        this.unsubscribe()
          .then(NOOP)
          .catch(NOOP);

        if (this.timerId !== -1) {
          clearInterval(this.timerId);
        }
      }

      private nextState (state: Partial<State>): void {
        if (this.isActive) {
          this.setState(state as State);
        }
      }

      private getParams (props: any): [boolean, unknown[]] {
        const paramValue = paramPick
          ? paramPick(props)
          : paramName
            ? props[paramName]
            : undefined;

        if (atProp) {
          at = props[atProp];
        }

        // When we are specifying a param and have an invalid, don't use it. For 'params',
        // we default to the original types, i.e. no validation (query app uses this)
        if (!paramValid && paramName && (isUndefined(paramValue) || isNull(paramValue))) {
          return [false, []];
        }

        const values = isUndefined(paramValue)
          ? params
          : params.concat(
            (Array.isArray(paramValue) && !(paramValue as any).toU8a)
              ? paramValue
              : [paramValue]
          );

        return [true, values];
      }

      private constructApiSection = (endpoint: string): [Record<string, Method>, string, string, string] => {
        const { api } = this.props;
        const [area, section, method, ...others] = endpoint.split('.');

        assert(area.length && section.length && method.length && others.length === 0, `Invalid API format, expected <area>.<section>.<method>, found ${endpoint}`);
        assert(['consts', 'rpc', 'query', 'derive'].includes(area), `Unknown api.${area}, expected consts, rpc, query or derive`);
        assert(!at || area === 'query', 'Only able to do an \'at\' query on the api.query interface');

        const apiSection = (api as any)[area][section];

        return [
          apiSection,
          area,
          section,
          method
        ];
      };

      private getApiMethod (newParams: unknown[]): ApiMethodInfo {
        if (endpoint === 'subscribe') {
          const [fn, ...params] = newParams;

          return [
            fn as Method,
            params,
            'subscribe'
          ];
        }

        const endpoints = [endpoint].concat(fallbacks || []);
        const expanded = endpoints.map(this.constructApiSection);
        const [apiSection, area, section, method] = expanded.find(([apiSection]): boolean =>
          !!apiSection
        ) || [{}, expanded[0][1], expanded[0][2], expanded[0][3]];

        if (section === 'democracy') {
          throw new Error('No democracy section');
        }

        assert(apiSection?.[method], `Unable to find api.${area}.${section}.${method}`);

        const meta = apiSection[method].meta;

        if (area === 'query' && meta?.type.isMap) {
          const arg = newParams[0];

          assert((!isUndefined(arg) && !isNull(arg)) || meta.type.asMap.kind.isLinkedMap, `${meta.name} expects one argument`);
        }

        return [
          apiSection[method],
          newParams,
          method.startsWith('subscribe') ? 'subscribe' : area
        ];
      }

      private async subscribe ([isValid, newParams]: [boolean, unknown[]]): Promise<void> {
        if (!isValid || skipIf(this.props)) {
          return;
        }

        const { api } = this.props;
        let info: ApiMethodInfo | undefined;

        await api.isReady;

        try {
          assert(at || !atProp, 'Unable to perform query on non-existent at hash');

          info = this.getApiMethod(newParams);
        } catch (error) {
          // don't flood the console with the same errors each time, just do it once, then
          // ignore it going forward
          if (!errorred[(error as Error).message]) {
            console.warn(endpoint, '::', error);

            errorred[(error as Error).message] = true;
          }
        }

        if (!info) {
          return;
        }

        const [apiMethod, params, area] = info;
        const updateCb = (value?: any): void =>
          this.triggerUpdate(this.props, value);

        await this.unsubscribe();

        try {
          if (['derive', 'subscribe'].includes(area) || (area === 'query' && (!at && !atProp))) {
            this.destroy = isMulti
              ? await apiMethod.multi(params, updateCb)
              : await apiMethod(...params, updateCb);
          } else if (area === 'consts') {
            updateCb(apiMethod);
          } else {
            updateCb(
              at
                ? await apiMethod.at(at, ...params)
                : await apiMethod(...params)
            );
          }
        } catch {
          // ignore
        }
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      private async unsubscribe (): Promise<void> {
        if (this.destroy) {
          this.destroy();
          this.destroy = undefined;
        }
      }

      private triggerUpdate (props: any, value?: any): void {
        try {
          const callResult = (props.transform || transform)(value);

          if (!this.isActive || isEqual(callResult, this.state.callResult)) {
            return;
          }

          triggerChange(callResult as OnChangeCb, callOnResult, props.callOnResult as OnChangeCb);

          this.nextState({
            callResult,
            callUpdated: true,
            callUpdatedAt: Date.now()
          });
        } catch {
          // ignore
        }
      }

      public override render (): React.ReactNode {
        const { callResult, callUpdated, callUpdatedAt } = this.state;
        const _props = {
          ...this.props,
          callUpdated,
          callUpdatedAt
        };

        if (!isUndefined(callResult)) {
          (_props as any)[propName || this.propName] = callResult;
        }

        return (
          <Inner {..._props} />
        );
      }
    }

    return withApi(WithPromise);
  };
}

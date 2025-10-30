import React from 'react';
import { createComponent } from '@lit/react';

type Constructor<T> = { new (): T };
type EventName<T extends Event = Event> = string & { __eventType: T };
type EventNames = Record<string, EventName | string>;

interface Options<I extends HTMLElement, E extends EventNames = {}> { // eslint-disable-line
  tagName: string;
  elementClass: Constructor<I>;
  events?: E;
  // Added React 19 options
  shadow?: 'open' | 'closed';
  properties?: Record<string, unknown>;
}

// 새로운 인터페이스 정의
interface ComponentOptions<I, E extends EventNames> {
  react: typeof React;
  elementClass: Constructor<I>;
  tagName: string;
  events?: E;
  shadow?: 'open' | 'closed';
  properties?: Record<string, unknown>;
}

/**
 * Converts a Lit Element to a React Component.
 * @param option - The options for the conversion.
 * @returns The converted React Component.
 */
export function convertReact<I extends HTMLElement, E extends EventNames = {}> // eslint-disable-line
  (option: Options<I, E>) 
{
  // 명시적으로 ComponentOptions 타입으로 캐스팅
  const componentOptions: ComponentOptions<I, E> = {
    react: React,
    elementClass: option.elementClass,
    tagName: option.tagName,
    events: option.events,
    shadow: option.shadow || 'open',
    properties: option.properties
  };
  
  return createComponent(componentOptions);
}
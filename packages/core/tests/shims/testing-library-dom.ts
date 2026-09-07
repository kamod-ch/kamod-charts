import type { FireFunction, FireObject } from "@testing-library/dom/types/events";
import type { waitForOptions } from "@testing-library/dom/types/wait-for";

// @ts-expect-error runtime subpath is untyped; types come from @testing-library/dom/types/*
import { fireEvent as domFireEvent } from "@testing-library/dom/dist/events.js";
// @ts-expect-error runtime subpath is untyped; types come from @testing-library/dom/types/*
import { waitFor as domWaitFor } from "@testing-library/dom/dist/wait-for.js";

type WaitFor = <T>(callback: () => Promise<T> | T, options?: waitForOptions) => Promise<T>;

export const fireEvent: FireFunction & FireObject = domFireEvent;
export const waitFor: WaitFor = domWaitFor;

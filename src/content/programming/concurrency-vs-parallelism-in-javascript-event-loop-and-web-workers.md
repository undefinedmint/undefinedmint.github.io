---
title: Concurrency vs Parallelism in JavaScript：Event Loop and Web Workers
type: programming
author: Mint
pubDatetime: 2024-08-23T12:05:51Z
featured: false
draft: false
tags:
  - Web
description: ""
---

JavaScript is single-threaded, meaning it can only execute one task at a time. 
But modern web applications often need to handle heavy computations, animations, or network requests without freezing the UI. How does JavaScript manage this?

## 1. Fundamental Concepts

### What Processes & Threads are at OS Level
- **Process** is **an executing program** with its own memory, resources and state.
- **Thread** is **a unit execution of a process**, and multiple threads can run inside a single process.


| Aspect                                      | Process                                                                                             | Thread                                                                                                                                                                      |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Termination/Creation/<br/>Context Switching Time | A process takes more time to terminate and also takes more time for creation and context switching. | A thread takes less time to terminate and also takes less time for creation and context switching.   |
| Memory Usage                                | Every process runs in its own memory.                                                               | Threads share memory.                                                                                                                                                       |
| Weight                                      | A process is heavyweight compared to a thread.                                                      | A Thread is lightweight as each thread in a process shares code, data, and resources.                                                                                       |
| Switching Mechanism                         | Process switching uses an interface in an operating system.                                         | Thread switching may not require calling involvement of operating system.                                                                                                   |
| Blocking Behavior                           | If one process is blocked, then it will not affect the execution of other processes.                | If a user-level thread is blocked, then all other user-level threads are blocked.                                                                                           |
| Control Structure                           | A process has its own Process Control Block, Stack, and Address Space.                              | Thread has Parents' PCB, its own Thread Control Block, and Stack and common Address space.                                                                                  |
| Parent-Child Relationship                   | Changes to the parent process do not affect child processes.                                        | Since all threads of the same process share address space and other resources so any changes to the main thread may affect the behavior of the other threads of the process. |
| Data Sharing                                | A process does not share data with each other.                                                      | Threads share data with each other.                                                                                                                                         |

### Concurrency vs Parallelism 

- **Concurrency** means managing multiple tasks at the same time by interleaving their execution. It doesn’t necessarily mean tasks run simultaneously, but that they progress without blocking each other.

- **Parallelism** means executing multiple tasks literally at the same time, which requires multiple CPU cores or threads running simultaneously.

JavaScript achieves concurrency on a single thread by cleverly scheduling tasks, while parallelism requires multiple threads or processes.

## 2. JavaScript's Single Threaded Nature

### Why JavaScript is Single-Threaded in the First Place
- Early JavaScript was designed for simple UI interactions like form validation.
- Multi-threading introduces complexity (race conditions, deadlocks)
- The DOM is not thread-safe, allowing multiple threads to modify it could lead to chaos.

### How JavaScript Handles Concurrency: **The Event Loop**
Instead of multi-threading, JavaScript uses an **Event Loop** to manage asynchronous tasks.
> The Event Loop is the mechanism that allows JavaScript to handle asynchronous operations efficiently. It ensures that non-blocking tasks (like `setTimeout`, `fetch`, or `click events`) can run without freezing the main thread.

1. **Call Stack**: Executed synchronous code(LIFO).
2. **Asynchronous Web APIs**: The browser(or Node.JS) provides APIs like `setTimeout`, `fetch` and `click events`. 
    
    How it works:
    - When called, the task is offloaded from the call stack to the Web API.
    - Upon completion, its callback is pushed to the Callback Queue.

3. **Callback Queue**: 

    - Macrotask Queue: `setTimeout`, `setInterval`, `fetch`, `XMLHttpRequest`, `DOM Event`
    - Microtask Queue: `Promise.then`, `Promise.catch`, `queueMicrotask`, `MutationObserver`

4. **Event Loop**: Coordinate the stack and queues.

    - Execute all synchronous code in Call Stack (until empty, and encountering Web APIs, the task is offloaded from Call Stack to the Web API environments).
    - Execute all Microtasks (until the microtask queue is empty).
    - Execute **one** Macrotask.
    - Repeat.


![SVG ](../../assets/programming/event_loop.svg)



### How to Intelligently Schedule Tasks on the Main Thread
JavaScript provides APIs to schedule tasks in ways that optimize responsiveness:

- **requestAnimationFrame**：Schedules a callback to run before the browser’s next repaint, ideal for smooth animations synchronized with the display refresh rate.

- **requestIdleCallback**：Allows scheduling of low-priority tasks to run during idle periods when the main thread is free, preventing interference with critical user interactions.

## 3. What Happens When a Single Thread Isn’t Enough

### How Web Workers Bring True Parallelism to JavaScript

> A Web Worker is an external JavaScript file that runs in the background, without affecting the performance of the page.

Once created, a worker can send messages to the JavaScript code that created it by posting messages to the event handler `onmessage` specified by that code (and vice versa).

Workers communicate with the main thread using an asynchronous messaging system. The main thread and the worker thread pass data to each other using the `postMessage()` method and listen for responses via the onmessage event handler.

### Main Thread vs Worker Thread

The primary distinction between the main thread and a worker thread lies in their purpose and capabilities. The main thread is responsible for everything the user sees and interacts with, while worker threads handle heavy lifting in the background.

| Feature | Main Thread | Worker Thread |
| :--- | :--- | :--- |
| **Primary Role** | Manages UI rendering, handles user events (clicks, scrolls), and executes the primary application logic. | Performs CPU-intensive or long-running computations in the background. |
| **DOM Access** | Has full, direct access to the `document` and `window` objects to manipulate the webpage. | Has no access to the DOM or `window` object. It operates in a separate global context. |
| **Execution Impact** | If a task blocks this thread, the entire webpage becomes unresponsive. | Operations in a worker do not block the UI, ensuring a smooth user experience. |
| **Communication** | Communicates with workers by sending and receiving messages. | Communicates with the main thread exclusively through the `postMessage()` method and `onmessage` event listener. |
| **Lifecycle** | Exists for the entire lifetime of the web page. | Can be created on-demand and terminated explicitly with the `worker.terminate()` method when no longer needed. |


### Scenarios

Web Workers are ideal for any task that could potentially block the main thread and degrade the user experience, such as 
- Complex mathematical calculations
- Data processing and parsing large JSON files
- Image or video processing on the client side
- Real-time data analysis or simulations
- Heavy computations in games or visualizations

e.g., using Math.js in a worker
```js
importScripts('https://unpkg.com/mathjs@14.5.2/lib/browser/math.js');

self.addEventListener('message', (event) => {
    const request = event.data;
    let result = null;
    let err = null; 
    
    try {
        const { formulas, variables = {}, functions = {} } = request;
        result = formulas.map(formula => calculate(formula, variables, functions));
    } catch (e) {
        err = e.message || String(e);
    }
    
    const response = {
        id: request.id,
        result,
        err,
    };
    self.postMessage(response);
});

function calculate(expression, variables = {}, functions = {}) {
    const scope = {
        ...variables,
        ...functions
    };
    return math.evaluate(expression, scope);
}
```


```ts
class MathWorkerManager {

    constructor() {
        this.worker = null;
        this.callbacks = new Map();
        this.nextId = 0;
    }

    init() {
        if (!this.worker) {
            this.worker = new Worker('./mathWorker.js');
            this.worker.onmessage = this.handleMessage.bind(this);
        }
    }

    evaluate(formulas, variables = {}, functions = {}) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                this.init();
            }
            
            const id = this.nextId++;
            this.callbacks.set(id, { resolve, reject });
            
            this.worker.postMessage({
                id,
                formulas,
                variables,
                functions
            });
        });
    }

    handleMessage(event) {
        const { id, result, err } = event.data;
        const callback = this.callbacks.get(id);
        
        if (callback) {
            if (err) {
                callback.reject(new Error(err));
            } else {
                callback.resolve(result);
            }
            this.callbacks.delete(id);
        }
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.callbacks.clear();
        }
    }
}

// To ensure only a single instance of the Math Worker exists application-wide
const mathWorkerManager = new MathWorkerManager();

export default mathWorkerManager;
```

```ts
import mathWorkerManager from './MathWorkerManager';


mathWorkerManager.evaluate(
  ['square(3)', 'square(a) + b'],
  { a: 2, b: 5 },
  functions
).then(results => {
  console.log(results); // [9, 9]
});
```

## 4. Specialized Workers for Different Jobs

The standard Web Worker we've discussed is technically known as a Dedicated Worker, meaning it is tied exclusively to the script that created it. However, the worker ecosystem is broader, offering specialized tools for different challenges. The JavaScript worker family primarily includes three types:

- **Dedicated Workers**: The most common type, used for offloading CPU-intensive computations from the main thread to a single background script.

- **Shared Workers**: A worker that can be accessed by multiple scripts running in different windows, iframes, or even other workers, as long as they share the same origin. This is useful for managing a shared state or coordinating tasks across different parts of an application.

- **Service Workers**: A powerful worker that acts as a proxy between the application and the network. It can intercept and handle network requests, manage a cache of responses, and enable features like offline functionality and push notifications.

---
title: How JavaScript Achieves Concurrency Without Multi-Threading - Event Loop, Workers, and More
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
The answer lies in understanding Processes, Threads and Web Workers.

## 1. What Processes & Threads are at OS level
> Process is **an executing program** with its own memory, resources and state.
- Processes are isolated - if one crashed, others remain unaffected.
- Switching between processes is resource-intensive because it involves context switching.
> Thread is **a unit execution of a process**, and multiple threads can run inside a single process.
- Threads share memory and resources, making them faster to create and switch between.

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

### The problem: Race conditions in Multi-Threading 


## 2. JavaScript's Single Threaded Nature

### Why JavaScript is single-threaded
- Early JavaScript was designed for simple UI interactions like form validation.
- Multi-threading introduces complexity (race conditions, deadlocks)
- The DOM is not thread-safe, allowing multiple threads to modify it could lead to chaos.

### How JavaScript handles Concurrency: **The Event Loop**
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


## 3. How **Web Workers** bring multi-threading to JavaScript
### What Web Worker is

### Main Thread vs Worker Thread 

### Scenarios

## 4. requestIdleCallback , requestAnimationFrame 

## 5. Concurrency vs Parallelism 

## 6. Advances Concurrency 

### Service Worker

### Worklets

## 7. Future of JavaScript Concurrency 

### ParallelJS
### WebGPU
### Shared Workers
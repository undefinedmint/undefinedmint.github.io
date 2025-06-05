---
title: From Processes, Threads to Web Workers - Deep Dive into JavaScript's Concurrency Model
type: programming
author: Mint
pubDatetime: 2024-08-23T02:05:51Z
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
- Threads are often called "lightweight processes" because they share some features of processes but are smaller and faster.

terminate, create, switch, communicate, memory, affect each other, data


## 2. Why JavaScript is single-threaded

## 3. How Web Workers bring multi-threading to JavaScript
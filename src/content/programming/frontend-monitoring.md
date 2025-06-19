---
title: Frontend Monitoring
type: programming
author: Mint
pubDatetime: 2025-01-02T14:01:05Z
featured: false
draft: false  
tags:
  - Monitor
description: "A comprehensive guide to frontend monitoring: concepts, key metrics, error collection principles, tools, and best practices."
---

## 1. What is Frontend Monitoring?

When designing applications, engineers need to understand how users will experience the application across a wide variety of scenarios. For example, a website built as a single-page application may react differently on certain browsers or devices, and teams may need to walk through all of these scenarios. At the same time, teams also need to monitor their applications to ensure each part is behaving as expected. Once an application is in production, errors and performance issues may occur and teams need to quickly troubleshoot to prevent a broken digital experience. **The process of proactively testing an application and monitoring user experiences in real time is called frontend monitoring.**

Unlike backend monitoring, which focuses on server health, frontend monitoring centers on what users actually see and interact with in their browsers.


### Types of Frontend Monitoring
- **Proactive Monitoring**: Synthetic tests and simulations to catch issues before users experience them, such as simulating slow network conditions or browser interactions.
- **Reactive Monitoring**: Real User Monitoring (RUM) and session replay that capture real user interactions and errors in production environments.
- **Hybrid Approach**: Combining both proactive and reactive monitoring for comprehensive coverage.

### Key Metrics to Monitor 
| **Category**                   | **Specific Metrics**                                                                 | **Description**                                                                 |
|-------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| **Error Monitoring**    | JS Errors, Promise Errors, Resource Loading Errors, Custom Errors             | Detect and diagnose frontend errors that impact functionality and user experience. | 
| **Performance Monitoring**   | Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift), Resource Loading Time, API Request Time, Device Compatibility, Third-Party Integrations, DNS/TCP/First-Byte Time, FPS Rate, Cache Hit Rate, First Screen Render Time, FP, FCP, FID, DOMContentLoaded, onload                                | Measure page responsiveness, loading speed, rendering quality, and API/backend responsiveness. |
| **Behavior Monitoring**      | Unique Visitors, Page Views, Page Access Depth, Page Stay Duration, Custom Event Tracking, User Clicks, Page Navigation, Conversion Funnel                           | Understand user engagement, navigation patterns, and interaction with features to optimize UX and business goals. |

### Benefits of Frontend Monitoring 
- **Improved User Experience**: Identify and fix issues that affect usability and satisfaction.
- **Faster Issue Resolution**: Quickly pinpoint and address bugs or performance bottlenecks.
- **Reduced Downtime**: Minimize business impact by catching errors before they escalate.
- **Data-Driven Decisions**: Use real metrics to prioritize improvements and new features.



## 2. How Frontend Error Collection Works

### 1️⃣ Global Error Handlers 
- `window.onerror`: Captures uncaught JavaScript errors globally, including error message, source file, line and column number.
- `window.onunhandledrejection`: Specifically listens for unhandled Promise rejections, which are common in modern asynchronous code.

### 2️⃣ Resource Loading Errors
Monitors failures of resources such as images, scripts, and stylesheets by listening to the `error` event on those elements.

### 3️⃣ Manual Error Reporting
Developers can use try-catch blocks and explicitly send errors or custom messages to the monitoring service for better context.

### 4️⃣ SDK Instrumentation

- Monitoring tools inject SDKs that hook into these handlers, enrich error data with breadcrumbs (user actions before error), device info, and stack traces.
- Source maps are uploaded to translate minified code stack traces back to original source code, making debugging easier.

### 5️⃣ Error Aggregation
Errors are grouped by similarity on the backend to reduce noise and help prioritize fixes based on frequency and impact.

## 3. Frontend Monitoring System Architecture

A complete frontend monitoring system consists of three main components: 
- **Data Collection and Reporting**  
  Instruments the frontend code to capture errors, performance metrics, and user behavior data in real time. This often involves embedding monitoring SDKs (e.g., Sentry, Datadog) that hook into browser APIs and event listeners.

- **Data Processing and Storage**  
  Collected data is sent to backend servers where it is processed, aggregated, and stored. This includes error grouping, deduplication, performance trend analysis, and enrichment with metadata like user context and device info.

- **Data Visualization and Alerting**  
  Dashboards and reports provide insights into frontend health, user experience, and business KPIs. Alerts notify teams of critical issues, enabling fast response.


## 4. Choosing the Right Tools 

Selecting the right tools depends on your application’s complexity, tech stack, and business needs. Some popular options include:

- **Sentry**  
  Comprehensive error and performance monitoring with session replay and rich context capture. Supports most frontend frameworks.

- **Datadog RUM**  
  Real User Monitoring integrated with full-stack observability.

- **Grafana Faro**  
  Open-source frontend observability SDK focusing on performance and behavior.


  ### Use Sentry as an example


  
  ## 5. Best Practices for Effective Frontend Monitoring 

  - **Instrument Early**: Integrate monitoring from the start of development to catch issues early.
  - **Combine Proactive and Reactive Approaches**: Use synthetic tests along with real user monitoring.
  - **Monitor Core Web Vitals**: These are critical for user experience and SEO.
  - **Customize Error Reporting**: Add contextual data like user actions, device info, and environment variables.
  - **Regularly Review and Act**: Make monitoring a part of your development and incident response workflows.


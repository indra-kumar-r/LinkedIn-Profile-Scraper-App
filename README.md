# LinkedIn Profile Scraper App

> A **microservices-based** LinkedIn profile scraping system built to help **recruiters** eliminate the manual effort of boolean searching and data collection.

---

## 🌟 Project Story

Recruiters spend hours manually running Boolean searches on LinkedIn to find profiles that match a job description — then copy-pasting results into Excel.

I wanted to automate that.

So I built **Scrapy**, a full-stack web app that:

-   let recruiters **run complex boolean searches** using keywords (like “React Developer in Bangalore”),
-   automatically **fetches results using SerpAPI**,
-   and stores, organises, and displays them beautifully — searchable, filterable, and exportable.

The goal: **reduce hours of sourcing into minutes**.

---

## 🚀 Features

### 🔍 LinkedIn Search Automation

-   Enter **boolean queries** just like on Google (e.g. `site:linkedin.com/in ('Full Stack Developer' OR 'Software Engineer') ('Python' AND 'React') ('3 years' OR '4 years' OR '5 years') ('Healthcare' OR 'Healthtech' OR 'US Healthcare') ('Pune' OR 'Bangalore' OR 'India')`).
-   Fetches results using **SerpAPI**.
-   Displays results in a clean, paginated table.

### 📦 Search History

-   View your previous searches.
-   See how many pages were scraped for each search.
-   Revisit or re-fetch old search results anytime.

### 🧾 Result Viewer

-   View all LinkedIn profiles grouped by search ID.
-   Combined organic results across multiple pages.
-   Displays title, snippet, and LinkedIn link.
-   Option to **export results to Excel**.

### 👤 User Management

-   Store and view user SerpAPI usage, plan, and status.
-   Keep track of searches per user, credits, and API usage.

### 💎 Modern, Seamless UI

-   Built with Angular.
-   Clean, minimal glass-style design with soft gradients.
-   Intuitive navigation between Search, History, and Users.

---

## 🧰 Tech Stack

| Layer            | Technologies                           |
| ---------------- | -------------------------------------- |
| **Frontend**     | Angular, SCSS, TypeScript              |
| **Backend**      | Go (Fiber Framework), Microservices    |
| **Database**     | MongoDB                                |
| **External API** | SerpAPI (for LinkedIn data extraction) |
| **Architecture** | Microservices                          |

---

## 🏗️ Architecture

This project follows a **microservices architecture** — each service is modular and responsible for a single domain.

### 🧩 Example Flow

1. **User logs in** via the frontend.
2. User enters a boolean query → **search-service** triggers a SerpAPI call.
3. Results are stored via **storage-service** into MongoDB.
4. The user can later view past results grouped by search ID via **history**.
5. Admin can view or update **user details** from **user-service**.

---

## 💡 Highlights

-   🚀 Microservice-based architecture for scalability
-   🧠 Real-world use case: automating recruiter workflows
-   🔄 Paginated search results + grouped history views
-   🔐 SerpAPI integration with per-user key management
-   ⚙️ Go Fiber backend with clean service layering
-   💅 Angular frontend with reusable components
-   📤 Excel export support for results

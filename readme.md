
<div align="center">
<h1 align="center">
<br>Sale-Products-API
</h1>
<h3>◦ </h3>
<h3>Tech & Tools</h3>

<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style&logo=JavaScript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/Nodemon-76D04B.svg?style&logo=Nodemon&logoColor=white" alt="Nodemon" />
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style&logo=Axios&logoColor=white" alt="Axios" />
<img src="https://img.shields.io/badge/Puppeteer-40B5A4.svg?style&logo=Puppeteer&logoColor=white" alt="Puppeteer" />
<img src="https://img.shields.io/badge/Docker-2496ED.svg?style&logo=Docker&logoColor=white" alt="Docker" />
<img src="https://img.shields.io/badge/JSON-000000.svg?style&logo=JSON&logoColor=white" alt="JSON" />
<img src="https://img.shields.io/badge/Express-000000.svg?style&logo=Express&logoColor=white" alt="Express" />
</p>
<img src="https://img.shields.io/github/languages/top/Muazzy/Sale-Products-API?style&color=5D6D7E" alt="GitHub top language" />
<img src="https://img.shields.io/github/languages/code-size/Muazzy/Sale-Products-API?style&color=5D6D7E" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/commit-activity/m/Muazzy/Sale-Products-API?style&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/license/Muazzy/Sale-Products-API?style&color=5D6D7E" alt="GitHub license" />
</div>

---

## 📒 Table of Contents
- [📒 Table of Contents](#📒-table-of-contents)
- [📍 Overview](#📍-overview)
- [🧩 Live On](#🧩-live-on)
- [⚠️ Note](#⚠️-note)
- [⚙️ Features](#⚙️-features)
- [📂 Project Structure](#📂-project-structure)
- [🚀 Getting Started](#🚀-getting-started)
- [🤝 Contributing](#🤝-contributing)

---


## 📍 Overview
This project aims to scrape data from multiple e-commerce websites to fetch sale products and provide relevant information such as titles, images, prices, and product links. For Websites with dynamic content, It utilizes Puppeteer, a Node.js library for controlling headless Chrome or Chromium browsers, to navigate the websites and extract the required data. Lastly for the static sites, it utilizes Cheerio for extraction. 

---

## 🧩 Live On

```sh
https://sale-products-api.onrender.com/api
```
### Example Requests
```js
GET https://sale-products-api.onrender.com/api/furror?pages=2
```
```js
GET https://sale-products-api.onrender.com/api/fitted
```
```js
GET https://sale-products-api.onrender.com/api/outfitters?products=20
```

---
## ⚠️ Note

```text
Please be aware that the API may experience occasional delays (almost few minutes) due to its hosting on a free instance on render.com. Additionally, the web scraping process using Puppeteer may take longer than usual to fully load websites and extract data.

It is important to consider these factors, keeping in mind that this API is built primiarly as a fun side project for learning and may not be suitable for any real-world applications.
```
---

## ⚙️ Features
- ### Scrapes sale products from multiple e-commerce websites
- ### Supports pagination for handling multiple pages
- ### Utilizes Puppeteer and Cheerio for data extraction
- ### Configuration through environment variables


---


## 📂 Project Structure


```bash
repo
├── Dockerfile
├── fitted.js
├── furor.js
├── index.js
├── outfitters.js
├── package.json
├── package-lock.json
└── price_formatter.js

0 directories, 8 files
```

--- 

## 🚀 Getting Started

### ✔️ Prerequisites

Before you begin, ensure that you have the following prerequisites installed:
> - [ℹ️ node js](https://nodejs.org/)
> - [ℹ️ npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### 📦 Installation

1. Clone the Sale-Products-API repository:
```sh
git clone https://github.com/Muazzy/Sale-Products-API
```

2. Change to the project directory:
```sh
cd Sale-Products-API
```

3. Install the dependencies:
```js
npm i
```

### 🎮 Using Sale-Products-API

```js
node start
```

---

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:
1. Fork the project repository. This creates a copy of the project on your account that you can modify without affecting the original project.
2. Clone the forked repository to your local machine using a Git client like Git or GitHub Desktop.
3. Create a new branch with a descriptive name (e.g., `new-feature-branch` or `bugfix-issue-123`).
```sh
git checkout -b new-feature-branch
```
4. Make changes to the project's codebase.
5. Commit your changes to your local branch with a clear commit message that explains the changes you've made.
```sh
git commit -m 'Implemented new feature.'
```
6. Push your changes to your forked repository on GitHub using the following command
```sh
git push origin new-feature-branch
```
7. Create a new pull request to the original project repository. In the pull request, describe the changes you've made and why they're necessary.
The project maintainers will review your changes and provide feedback or merge them into the main branch.

---
### readme template generated with: [readme-ai](https://github.com/eli64s/README-AI)
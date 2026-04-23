# COMP3278 - HKU Spring 2026

Social Media Application - HKgram

## Team Members

| Name             | Student ID | GitHub Profile |
| ---------------- | ---------- | -------------- |
| Fatima-Tul-Zahra | 3036217037 | https-fatima   |
| Dengshuyu        | 3033104198 | drunkat        |
| Tang Yiping      | 3036253873 | tangyiping2005 |
| Yu Tin Yau       | 3036067353 | lolimast3r     |
| Sami Erafii      | 3036677926 | serafii        |

## Project Description

This project develops a simplified social media platform (HKgram) with a focus on database design and SQL querying. Users can create posts with text and images, like and interact with content, and view posts through a dynamic feed. The system highlights relational data modeling, efficient queries, and basic analytics such as trending posts and user activity, implemented using React, FastAPI, and MySQL.

## Specifications

- **Frontend**: React / TypeScript
- **Backend**: Python (FastAPI)
- **Database**: MySQL

## Requirements Description

- Users can create accounts with unique usernames and login to their accounts
- Users can create posts with images via URL
- Users can visualize posts in their feed
- Each post should display: Username, Text description, Image, Timestamp
- Users can like and unlike posts

## Work Methodology

- Selected an assigned issue
- Create a separate branch for that specific issue
- Add your changes
- Commit and push
- Open a new Pull Request
- Wait for at least one teammate approval
- Merge and delete branch

## Backend Workflow

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Create a Python virtual environment if you have not done so already:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   **macOS / Linux**

   ```bash
   source venv/bin/activate
   ```

   **Windows**

   ```bash
   venv\Scripts\activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

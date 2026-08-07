# Daily Spark

help me to build the app named Discipline here is the prd 
Product Requirements Document

Gamified Checklist & Productivity Dashboard

Version: 1.0 (Draft) Status: For review

1. Overview

A checklist and task-management app that makes completing everyday tasks feel rewarding instead of like a chore. The core bet: people don't fail to be productive because they lack a to-do list — they fail because to-do lists are boring and give no feedback. This app fixes that by pairing flexible task planning with strong gamification and a dashboard people want to open every day.

2. Problem Statement

Most checklist/to-do apps are functional but emotionally flat — completing a task feels the same as not completing it.

Rigid apps force tasks into a single timeframe (daily-only, or project-only), which doesn't match how people actually think (some tasks are daily habits, some are weekly goals, some are month-long projects with sub-steps).

Users have multiple unrelated areas of life (academics, work projects, fitness, personal) and lose track of where a task belongs.

Without a reward loop, motivation drops after the first few days — classic productivity-app drop-off.

3. Goals & Success Metrics

GoalMetricMake task completion feel rewardingAvg. tasks completed per active user per dayDrive daily habit formationDay-7 and Day-30 retention rateSupport flexible planning% of users using more than one timeline type (day/week/month)Encourage organizationAvg. number of segments/sectors created per userBuild a "sticky" dashboardAvg. session frequency per day, avg. session lengthSustain long-term motivationStreak survival rate at 7/30/90 days

North Star Metric: Weekly Active Completion Rate (% of created tasks marked complete within their set timeframe).

4. Target Users

Students managing academics, assignments, exams across subjects.

Working professionals / freelancers managing multiple projects.

Self-improvement / habit-builders wanting a fun way to track routines, fitness, hobbies.

Multi-taskers juggling personal + professional life who need clear separation of contexts.

5. Core Features

5.1 Flexible Task Timelines

User can create a task under Day, Week, or Month view.

A task can be broken down into subtasks (checklist within a checklist), each independently checkable.

Tasks can optionally be recurring (daily habit, every weekday, weekly, custom).

Users can move/reschedule a task between timelines (e.g., push a daily task to next week) without losing progress on subtasks.

Optional due time, not just due date, for time-blocking style planning.

5.2 Segments & Sectors

Users create custom Sectors (top-level life areas) — e.g., Academics, Work Project, Fitness, Personal.

Each sector can have color/icon customization for quick visual recognition.

Within a sector, users can create Segments (sub-categories) — e.g., under Academics: "Math," "Thesis," "Exam Prep."

Every task is tagged to a sector (and optionally a segment), so the dashboard can filter/group by area of life.

A "My Sectors" view shows completion health per sector (e.g., Academics 80% complete this week, Fitness 30%).

5.3 Gamified Interactive Dashboard

This is the emotional core of the app — the dopamine-driving layer.

XP & Levels: Every completed task/subtask earns XP. Harder or larger tasks (based on subtask count or user-set difficulty) earn more XP. Users level up over time.

Streaks: Visual streak counter per habit/recurring task and an overall daily streak. Streak-freeze tokens (earned or limited) to protect against one missed day, reducing anxiety-driven churn.

Micro-celebrations: Satisfying check animation, sound, and haptic feedback on task completion (checkbox "pop," confetti burst on completing all tasks for the day).

Progress rings/bars: Per-sector and overall daily/weekly progress rings that visibly fill up — designed to trigger completion urge (Zeigarnik effect).

Badges & Achievements: Unlockable badges for milestones (first 7-day streak, 100 tasks completed, first sector maxed out, "Comeback" badge for returning after a break — framed positively, not shaming).

Avatar / Garden / Pet growth metaphor (optional, pick one): A visual companion (plant, pet, avatar, or city) that grows/evolves as the user completes tasks — gives a persistent, visual sense of accumulated progress beyond numbers.

Daily Quest / Combo bonus: Completing all tasks in a sector, or all tasks for the day, triggers a bonus reward and a distinct "perfect day" animation.

Leaderboard (optional, opt-in): Compare streaks/XP with friends or join public leaderboards for accountability — must be opt-in to avoid demotivating users who fall behind.

Weekly recap: A shareable summary card (like Spotify Wrapped style) showing the week's wins, best sector, longest streak.

5.4 Dashboard UX

Home dashboard shows: today's tasks, current streak, XP/level, sector progress rings, and a "next best action" prompt.

Quick-add task from anywhere (floating action button) with natural language input (e.g., "Finish thesis draft by Friday" auto-detects timeline and due date).

Drag-and-drop reordering and drag between Day/Week/Month views.

Dark mode and light mode, with sector color theming carried through the UI.

Empty states are motivational, not blank ("Nothing here yet — add your first task and start your streak!").

Reminder/notification system that's encouraging in tone, not guilt-inducing (no "You failed 3 tasks today" — instead "2 tasks left, you've got this").

6. Additional Feature Suggestions (beyond original ask)

Smart task breakdown suggestions: When a user adds a large task, the app can suggest breaking it into subtasks (e.g., "Write thesis" → suggests "Outline," "Draft intro," "Draft body," "Edit").

Focus mode / Pomodoro integration: Tie a focus timer to a specific task for deep-work sessions, awarding bonus XP for focused time.

Mood/energy check-in: Optional 1-tap mood log when opening the app, used later to show correlation between mood and productivity trends.

Insights tab: Analytics on completion rate by sector, best day/time of productivity, streak history graph — helps users self-optimize.

Template library: Pre-built checklists for common goals (exam prep plan, project launch checklist, fitness routine) users can clone into their sectors.

Widget support: Home-screen widget showing today's tasks and progress ring for quick glanceable motivation without opening the app.

Cross-device sync + offline mode.

7. Non-Functional Requirements

Performance: Dashboard should load in under 1s for typical user data volumes.

Reliability: Task/streak data must never be lost — local-first storage with cloud sync and conflict resolution.

Accessibility: Color-blind friendly palettes for sectors (icons/patterns, not color alone); full screen-reader support.

Privacy: Sector/task content is private by default; leaderboard/social features are opt-in only.

Cross-platform: iOS, Android, and Web (or at minimum mobile-first with responsive web).

8. Ethical Guardrail on Gamification

Reward mechanics should reinforce healthy habit-building, not exploit compulsive engagement. Guidelines:

No punitive mechanics that punish users for missing days (e.g., losing all XP/levels).

Streak-freeze / grace periods to reduce all-or-nothing anxiety.

No dark-pattern notifications designed purely to re-engage via guilt.

Leaderboards and comparisons are always opt-in.

9. Suggested Phased Rollout

Phase 1 — MVP

Day/Week/Month task creation with subtasks

Sectors & segments

Basic XP, levels, streaks, completion animations

Core dashboard

Phase 2 — Engagement Layer

Badges/achievements

Avatar/growth companion

Weekly recap card

Notifications tuned for motivation

Phase 3 — Growth & Insights

Opt-in leaderboards/social

Insights/analytics tab

Template library

Focus mode / Pomodoro

Widgets

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/853f2eff-f967-40c3-9294-9d0269d6aea8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Soma Capital Technical Assessment

This is a technical assessment as part of the interview process for Soma Capital.

> [!IMPORTANT]
> You will need a Pexels API key to complete the technical assessment portion of the application. You can sign up for a free API key at https://www.pexels.com/api/

To begin, clone this repository to your local machine.

## Development

This is a [NextJS](https://nextjs.org) app, with a SQLite based backend, intended to be run with the LTS version of Node.

To run the development server:

```bash
npm i
npm run dev
```

## Task:

Modify the code to add support for due dates, image previews, and task dependencies.

### Part 1: Due Dates

When a new task is created, users should be able to set a due date.

When showing the task list is shown, it must display the due date, and if the date is past the current time, the due date should be in red.

### Part 2: Image Generation

When a todo is created, search for and display a relevant image to visualize the task to be done.

To do this, make a request to the [Pexels API](https://www.pexels.com/api/) using the task description as a search query. Display the returned image to the user within the appropriate todo item. While the image is being loaded, indicate a loading state.

You will need to sign up for a free Pexels API key to make the fetch request.

### Part 3: Task Dependencies

Implement a task dependency system that allows tasks to depend on other tasks. The system must:

1. Allow tasks to have multiple dependencies
2. Prevent circular dependencies
3. Show the critical path
4. Calculate the earliest possible start date for each task based on its dependencies
5. Visualize the dependency graph

## Design Decisions

- Used Next.js Server Components + Server Actions instead of client-side fetching (SWR/TanStack Query). Server components fetch data directly via Prisma with no client-side waterfall or loading spinner. Mutations use `"use server"` functions with `revalidatePath` to trigger re-renders. Only interactive leaf components (forms, delete buttons) are client components. This keeps the JS bundle small and avoids the complexity of client-side cache management, which is appropriate for this app's scope. For a production app with frequent polling, optimistic updates across many components, infinite scroll, or offline support, a client-side data layer like TanStack Query would be worth adding.

## Submission:

1. Add a new "Solution" section to this README with a description and screenshot or recording of your solution.
2. Push your changes to a public GitHub repository.
3. Submit a link to your repository in the application form.

Thanks for your time and effort. We'll be in touch soon!

## Solution

### Due Dates

Tasks accept an optional due date via the inline add row. Due dates display as a sortable column in the task table, overdue dates appear in red with a warning indicator.

### Image Previews

On task creation, the Pexels API is queried using the task title. The returned image appears as a thumbnail in the expanded row detail, with an animated skeleton loading state. Clicking the thumbnail opens a full-size preview dialog.

### Task Dependencies

Expanding a task row reveals a dependency selector with search and multi-select. Cycle detection runs both client-side (disabling invalid options in the selector) and server-side (rejecting the mutation) using DFS reachability. The graph algorithms (Kahn's topological sort, longest-chain critical path, and earliest-start-date propagation) live in `src/lib/graph/` as pure functions.

Switching to the "Dependencies" tab shows an interactive React Flow graph with hierarchical layout. Critical path edges are animated and highlighted in blue; non-critical edges are dimmed. Each expanded task row also shows its computed earliest start date and critical path membership.

### Tech Choices

- **Server Components + Server Actions**: data fetches via Prisma with no client-side waterfall; only interactive leaves are client components
- **TanStack React Table**: sortable, filterable task table with expandable rows
- **nuqs**: tab state persisted in the URL for shareability
- **shadcn/ui**: consistent component library (Radix + Tailwind)

### Screenshots

![Task list with due dates and status filters](docs/landing.png)
_Task list with sortable due dates. Overdue dates shown in red_

![Adding a new task with a due date](docs/adding-a-new-task.png)
_Inline task creation with optional due date_

![Expanded task rows with image previews and dependencies](docs/expanded-tasks.png)
_Expanded rows showing Pexels image preview, dependency selector, earliest start date, and critical path membership_

![Filtered task view](docs/filtered-tasks.png)
_Filtering tasks by status_

![Dependency graph visualization](docs/dependency-graph.png)
_Interactive dependency graph with critical path highlighted in blue_

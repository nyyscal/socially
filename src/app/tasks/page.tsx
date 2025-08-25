import React from 'react'
import { Task } from '../api/tasks/route'

const TasksPage = async () => {
  const response = await fetch("http://localhost:3000/api/tasks",{
    cache:"no-store"
  })
  const tasks:Task[] = await response.json()
  // console.log(tasks)
  return (
    <div>
      {tasks.map((task,id)=>(
        <div key={id}>
          {task.title}
        </div>
      ))}
    </div>
  )
}

export default TasksPage
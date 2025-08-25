
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface CreateTaskRequest{
  title:string;
}

let tasks: Task[] = [
  {id:1, title:"Learn", completed:false},
  {id:2, title:"Learn JS", completed:true},
]

export async function GET(){
  return Response.json(tasks)
}

export async function POST(request: Request){
  try{
    const body: CreateTaskRequest = await request.json()

    if(!body.title){
      return Response.json({error:"Error in Post"},{status:4000})
    }

    const newTask: Task={
      id:tasks.length +1,
      title: body.title,
      completed:false
    }
    tasks.push(newTask)
    return Response.json(newTask, {status:201})
  }catch(error){
    return Response.json({error:"Invalid POST!"})
  }
}
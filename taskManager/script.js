import taskDB from "./taskDB.js";
import swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

const db = new taskDB();

window.onload = async () => {
  await db.openDB();
  await renderTask();
  const tasks = await db.getAllTasks();
  console.log(tasks);

  document.getElementById("formSection").style.display = "none";
  document.getElementById("listSection").style.display = "block";
};

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
  const input = document.getElementById("input").value;
  const textarea = document.getElementById("textarea").value;
  const dateStart = document.getElementById("date_start").value;
  const dateEnd = document.getElementById("date_end").value;
  const timeStart = document.getElementById("time_start").value;
  const timeEnd = document.getElementById("time_end").value;
  const textId = `text-${Date.now()}`;

  const startDateTime = new Date(`${dateStart}T${timeStart}`);
  const endDateTime = new Date(`${dateEnd}T${timeEnd}`);

  console.log(startDateTime);

  if (input === "") return;

  const data = {
    id: textId,
    title: input,
    description: textarea,
    start: startDateTime.getTime(),
    end: endDateTime.getTime(),
    isArchived: false,
  };

  await db.addTask(data);
  await renderTask();
  const tasks = await db.getAllTasks();
  console.log("updated Tasks", tasks);

  document.getElementById("formSection").reset();

  document.getElementById("formSection").style.display = "none";
  document.getElementById("listSection").style.display = "block";
});

const renderTask = async () => {
  let tasks = await db.getAllTasks();
  tasks.sort((a, b) => b.start - a.start);

  const list = document.getElementById("taskList");
  list.textContent = "";
  console.log(tasks);

  const searchText = document.getElementById("searchInput").value.toLowerCase();

  const filter = document.getElementById("filterSelect").value;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  tasks = tasks.filter((task) => task.title.toLowerCase().includes(searchText));

  if (filter === "today") {
    tasks = tasks.filter((task) => {
      const taskDate = new Date(task.start);
      return taskDate >= today && taskDate < tomorrow;
    });
  } else if (filter === "tomorrow") {
    tasks = tasks.filter((task) => {
      const taskDate = new Date(task.start);
      return (
        taskDate >= tomorrow &&
        taskDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      );
    });
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("li");
    const a = document.createElement("a");
    a.href = `#${task.id}`;
    a.textContent = `${task.title} - ${new Date(task.start).toLocaleString(
      "fa-IR"
    )}`;

    a.addEventListener("click", function () {
      document.getElementById("formSection").style.display = "block";
      document.getElementById("listSection").style.display = "none";

      document.getElementById("input").value = task.title;
      document.getElementById("textarea").value = task.description;
      document.getElementById("date_start").value = new Date(task.start)
        .toISOString()
        .slice(0, 10);
      document.getElementById("time_start").value = new Date(task.start)
        .toISOString()
        .slice(11, 16);
      document.getElementById("date_end").value = new Date(task.end)
        .toISOString()
        .slice(0, 10);
      document.getElementById("time_end").value = new Date(task.end)
        .toISOString()
        .slice(11, 16);
    });

    const dltBtn = document.createElement("button");
    dltBtn.textContent = "حذف";
    dltBtn.classList.add("btn");

    dltBtn.addEventListener("click", async () => {
      const isConfirmed = await swal.fire({
        title: "حذف تسک",
        text: "آیا میخواهید تسک حذف شود؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "حذف شود",
        cancelButtonText: "خیر",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      });

      if (!isConfirmed.isConfirmed) return; // اگر کاربر کنسل کرد هیچی پاک نشه

      await db.deleteTask(task.id);
      await renderTask();
    });

    li.addEventListener("dblclick", async function () {
      li.contentEditable = true;
      li.addEventListener(
        "blur",
        async () => {
          li.contentEditable = false;
          const updatedTitle = li.textContent.split(" - ")[0];
          const updatedTask = {
            ...task,
            title: updatedTitle,
          };

          await db.addTask(updatedTask);
          await renderTask();
        },
        { once: true }
      );
    });

    li.appendChild(a);
    li.appendChild(dltBtn);
    list.appendChild(li);
  });
};

const addTask = document.getElementById("addTask");

addTask.addEventListener("click", function () {
  document.getElementById("formSection").style.display = "block";
  document.getElementById("listSection").style.display = "none";
});

const listTask = document.getElementById("listTask");

listTask.addEventListener("click", function () {
  document.getElementById("formSection").style.display = "none";
  document.getElementById("listSection").style.display = "block";
});

document.getElementById("searchInput").addEventListener("input", renderTask);

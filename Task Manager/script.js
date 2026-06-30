const UI = {
  // ملحوظة: الكود الأصلي كان حاططهم في span واحد، إنت مقسمهم لـ 3 وده أحسن وأشيك!
  totalTasks: document.getElementById("total-tasks"), // رقم إجمالي المهام
  pendingTasks: document.getElementById("pending-tasks"), // رقم المهام اللي لسه مخلصتش
  doneTasks: document.getElementById("done-tasks"), // رقم المهام اللي خلصت
  taskShow: document.getElementById("task-show"), // رقم المهام المعروضة حالياً (جنب كلمة Tasks)
  noOfTasks: document.getElementById("No-of-tasks"), // رقم المهمة الواحدة (اللي بتظهر في كل كارت)

  // 🎯 عناصر الفلترة والبحث
  filterButtons: document.querySelectorAll(".filters button"), // الحاوية اللي شايلة زراير (All, Pending, Done)
  searchInput: document.getElementById("search-input"), // مربع البحث في العناوين والوصف

  // 🎯 عناصر فورم الإضافة (Add Task)
  titleInput: document.getElementById("title-input"), // مربع كتابة عنوان المهمة
  descInput: document.getElementById("description-input"), // مربع كتابة وصف المهمة
  btnAdd: document.getElementById("add-task-btn"), // زرار "Add Task"
  btnReset: document.getElementById("reset-btn"), // زرار "Reset" لتفريغ المربعات

  // 🎯 عناصر التحكم العامة
  btnSeed: document.getElementById("seed-btn"), // زرار "Seed" (عشان يضيف داتا وهمية نجرب بيها)
  btnClearAll: document.getElementById("clearAll-btn"), // زرار "Clear All" (عشان يمسح كل الداتا)

  // 🎯 حاوية عرض المهام (الـ Container الأساسي)
  tasksContainer: document.getElementById("tasks-container"), // المربع الكبير اللي الجافاسكريبت هيرمي جواه كروت المهام
  noTasksMessage: document.getElementById("no-tasks-message"), // رسالة "No tasks match" اللي بتظهر لو مفيش مهام

  // 🎯 عناصر الرسائل (Error & Toast)
  errorMessage: document.getElementById("error-box"),
  toastMessage: document.getElementById("toast-box"),

  btnMarkDone: document.getElementById("mark-done-btn"), // زرار "Mark Done" داخل كل كارت
  btnMarkPending: document.getElementById("mark-pending-btn"), // زرار "Mark Pending" داخل كل كارت
  btnDelete: document.getElementById("delete-btn"), // زرار "Delete" داخل كل كارت
};

let db = null; // ده اللي هيشيل اتصال قاعدة البيانات (IndexedDB) لما نفتحها
let tasks = []; // دي المصفوفة اللي هتشيل الداتا في الرامات عشان الواجهة تترسم بسرعة
let currentFilter = "all"; // ده بيسجل إحنا واقفين على أي فلتر دلوقتي

function openDB() {
  // بنرجع Promise عشان نقدر نستخدم await ولما الداتابيز تفتح نكمل شغل
  return new Promise((resolve, reject) => {
    // 1. اطلب من المتصفح يفتح داتابيز اسمها "TaskDB" إصدار رقم 1
    const request = indexedDB.open("TaskDB", 1);

    // 2. الحدث ده (onupgradeneeded) بيشتغل في حالتين بس:
    // - لو دي أول مرة اليوزر يفتح الموقع والداتابيز مش موجودة.
    // - لو إنت غيرت رقم الإصدار (مثلاً خليته 2) عشان تزود Object Store جديد.
    request.onupgradeneeded = () => {
      const db = request.result; // مسكنا الداتابيز في إيدينا

      // بننشئ الـ Object Store (زي الـ Table) وهنسميه "tasks"
      // keyPath: "id" -> بنقوله إن الـ Primary Key بتاعنا اسمه id
      // autoIncrement: true -> بنخليه يولد الأرقام لوحده (1, 2, 3...) وريحنا دماغنا من الـ Date.now()!
      const store = db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
      });

      // بنعمل الفهارس (Indexes) عشان نقدر نبحث ونفلتر الداتا بسرعة بعدين
      store.createIndex("status", "status", { unique: false });
      store.createIndex("createdAt", "createdAt", { unique: false });
    };

    // 3. لو الداتابيز فتحت بنجاح (سواء كانت لسه متأسسة أو موجودة من قبل كده)
    request.onsuccess = () => {
      resolve(request.result); // بنبعت الداتابيز للكود بتاعنا عشان نستخدمها
    };

    // 4. لو حصل أي خطأ (مثلاً المتصفح مانع التخزين)
    request.onerror = () => {
      reject(request.error || new Error("Failed to open database"));
    };
  });
}

/* =========================================================
    دوال مساعدة للتعامل مع الـ IndexedDB بسهولة
========================================================= */

// 1. دالة بتفتح Transaction وترجعلنا الـ Store (المخزن) جاهز
function tx(storeName, mode = "readonly") {
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// 2. دالة بتحول أوامر الـ IndexedDB القديمة لـ Promise عشان نقدر نستخدم await
function idbRequestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result); // لو نجحت، رجع النتيجة
    request.onerror = () =>
      reject(request.error || new Error("IDB Request Failed")); // لو فشلت، رجع الخطأ
  });
}

/* =========================================================
    عمليات الـ CRUD الأساسية (Create & Read)
========================================================= */

async function readAllTasks() {
  const store = tx("tasks", "readonly"); // فتحنا المخزن للقراءة فقط (عشان أسرع)

  const allTasks = await idbRequestToPromise(store.getAll());

  // بنرتب المهام بحيث الأحدث (اللي لسه متضاف) يظهر فوق
  allTasks.sort((a, b) => b.createdAt - a.createdAt);

  return allTasks;
}

async function createTask({ title, description }) {
  const now = Date.now();

  // بنجهز الـ Object اللي هيتخزن (من غير ID لأن الداتابيز هتعمله لوحدها)
  const task = {
    title: title,
    description: description,
    status: "pending", // أي مهمة جديدة بتبدأ Pending
    createdAt: now,
    updatedAt: now,
  };

  const store = tx("tasks", "readwrite"); // فتحنا المخزن للقراءة والكتابة

  // بنضيف التاسك للداتابيز، والـ add بترجعلنا الـ ID الجديد اللي اتعمل
  const newId = await idbRequestToPromise(store.add(task));

  // بنرجع التاسك كامل للواجهة بتاعتنا (طبعاً بعد ما لزقنا فيه الـ ID الجديد)
  return { ...task, id: newId };
}

async function updateTask(id, patch) {
  const store = tx("tasks", "readwrite");

  // 1. نجيب التاسك القديم الأول
  const existing = await idbRequestToPromise(store.get(id));
  if (!existing) throw new Error("Task not found");

  // 2. ندمج الداتا القديمة مع التعديل الجديد (Patch)
  const updated = { ...existing, ...patch, updatedAt: Date.now() };

  // 3. نحفظه تاني في الداتابيز
  await idbRequestToPromise(store.put(updated));
  return updated;
}

async function deleteTask(id) {
  const store = tx("tasks", "readwrite");
  await idbRequestToPromise(store.delete(id));
}

// =========================================================
//  دوال مساعدة للتعامل مع الواجهة (UI) وعرض البيانات
// =========================================================

function render() {
  // 1. أول حاجة بنفضي الكونتينر عشان الكروت القديمة متتكررش
  UI.tasksContainer.innerHTML = "";

  const total = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  UI.totalTasks.textContent = total;
  UI.pendingTasks.textContent = pendingCount;
  UI.doneTasks.textContent = doneCount;

  const visibleTasks = getVisibleTasks();

  UI.taskShow.textContent = visibleTasks.length;

  // 2. لو المصفوفة فاضية، نظهر رسالة "No tasks" ونخفي العدادات بصفر
  if (visibleTasks.length === 0) {
    UI.noTasksMessage.style.display = "block"; // نظهر رسالة "No tasks"
    return; // وقف الدالة هنا
  }

  // 3. لو في داتا، نخفي رسالة "No tasks"
  UI.noTasksMessage.style.display = "none";

  // 4. نلف على المهام اللي في المصفوفة ونبني كارت لكل واحدة
  let htmlString = ""; // هنجمع فيه الكروت كلها

  visibleTasks.forEach((task) => {
    const isDone = task.status === "done";
    const statusText = isDone ? "Done" : "Pending";
    const toggleButtonHTML = isDone
      ? `<button class="btn-markPending" id="mark-pending-btn" data-action="toggle">Mark Pending ↩</button>`
      : `<button class="btn-markDone" id="mark-done-btn" data-action="toggle">Mark Done ✅</button>`;

    // بنلزق HTML الكارت بتاعك، وبنحط جواه المتغيرات (Dynamic Data)
    htmlString += `
      <div class="task-card ${isDone ? "done" : "pending"}" data-id="${task.id}">
        <div class="card-content">
          <h4>${task.title}</h4>
          <p class="task-desc">${task.description || "—"}</p>

          <div class="task-card-footer">
            <div class="tags-group">
              <span class="tag id-tag">#${task.id}</span>
              <span class="tag status-tag">${statusText}</span>
            </div>
            <span class="date-text">Created: ${new Date(task.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div class="task-actions">
          ${toggleButtonHTML}
          <button class="btn-delete" id="delete-btn" data-action="delete">Delete 🗑️</button>
        </div>
      </div>
    `;
  });

  // 5. بعد ما جمعنا كل الكروت، بنرميها في الشاشة مرة واحدة (ده أفضل للأداء)
  UI.tasksContainer.innerHTML = htmlString;
}

(async function boot() {
  try {
    // 1. افتح الاتصال بقاعدة البيانات الأول
    db = await openDB();

    // 2. بعد ما تفتح، اقرأ كل المهام اللي متخزنة فيها وحطها في المصفوفة
    tasks = await readAllTasks();

    // 3. أخيراً، ارسم الداتا دي على الشاشة
    render();
  } catch (error) {
    UI.errorMessage.textContent = "Failed to initialize the database!";
    UI.errorMessage.style.display = "block";
    console.error("Boot Error:", error);
  }
})();

function getVisibleTasks() {
  const searchQuery = UI.searchInput.value.trim().toLowerCase();

  return tasks.filter((task) => {
    // 2. هل المهمة بتطابق زرار الفلتر؟ (All, Pending, Done)
    const matchesFilter =
      currentFilter === "all" ? true : task.status === currentFilter;

    // 3. هل المهمة بتطابق كلمة البحث في العنوان أو الوصف؟
    const titleMatch = task.title.toLowerCase().includes(searchQuery);
    const descMatch = (task.description || "")
      .toLowerCase()
      .includes(searchQuery);

    // لو مربع البحث فاضي، يبقى `matchesSearch` هتكون `true` لكل المهام
    const matchesSearch = searchQuery === "" ? true : titleMatch || descMatch;

    // 4. رجع الكارت ده للشاشة لو بيطابق الفلتر **وكمان** بيطابق البحث
    return matchesFilter && matchesSearch;
  });
}

UI.searchInput.addEventListener("input", () => {
  render(); // ارسم الشاشة تاني (والرسم هيستخدم المصفى الجديد اللي فيه السيرش)
});

UI.filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // الخطوة الأولى: نمسح كلاس 'active' من كل الزراير بلا استثناء
    UI.filterButtons.forEach((btn) => btn.classList.remove("active"));

    // الخطوة التانية: نحط كلاس 'active' للزرار اللي اليوزر داس عليه بس
    button.classList.add("active");
    // الخطوة التالتة: نغير الفلتر الحالي ونرسم الشاشة تاني
    currentFilter = button.textContent.trim().toLowerCase();
    render();
  });
});

UI.btnAdd.addEventListener("click", (event) => {
  event.preventDefault(); // عشان ما يحصلش ريفريش للصفحة لما نضغط "Add Task"

  const title = UI.titleInput.value.trim();
  const description = UI.descInput.value.trim();
  if (title === "") {
    UI.errorMessage.textContent = "Title is required!";
    UI.errorMessage.style.display = "block";
    setTimeout(() => {
      UI.errorMessage.style.display = "none";
    }, 3000); // نخفي رسالة الخطأ بعد 3 ثواني
    return;
  }

  UI.errorMessage.style.display = "none"; // نخفي رسالة الخطأ لو العنوان موجود

  createTask({ title, description })
    .then((newTask) => {
      tasks.unshift(newTask); // نضيف التاسك الجديد في بداية المصفوفة عشان يظهر فوق
      render(); // نرسم الواجهة تاني عشان نحدثها بالتاسك الجديد
      UI.toastMessage.textContent = "Task added successfully! ✅";
      UI.toastMessage.style.display = "block";
      setTimeout(() => {
        UI.toastMessage.style.display = "none";
      }, 3000); // نخفي رسالة النجاح بعد 3 ثواني
      UI.titleInput.value = "";
      UI.descInput.value = "";
    })
    .catch((error) => {
      UI.errorMessage.textContent = "Failed to add task. Please try again.";
      UI.errorMessage.style.display = "block";
      console.error("Error adding task:", error);
    });
});

UI.btnReset.addEventListener("click", (event) => {
  event.preventDefault();
  UI.titleInput.value = "";
  UI.descInput.value = "";
  UI.errorMessage.style.display = "none"; // نخفي رسالة الخطأ لو كانت ظاهرة
});

UI.btnClearAll.addEventListener("click", async () => {
  if (
    !confirm(
      "Are you sure you want to clear all tasks? This action cannot be undone.",
    )
  ) {
    return; // لو اليوزر ضغط "Cancel"، ما نعملش حاجة
  }
  try {
    const store = tx("tasks", "readwrite");
    await idbRequestToPromise(store.clear()); // بنمسح كل الداتا من الـ Object Store
    tasks = []; // بنفضي المصفوفة في الرامات كمان
    render();
    UI.toastMessage.textContent = "All tasks cleared! 🧹";
    UI.toastMessage.style.display = "block";
    setTimeout(() => {
      UI.toastMessage.style.display = "none";
    }, 3000); // نخفي رسالة النجاح بعد 3 ثواني
  } catch (error) {
    UI.errorMessage.textContent = "Failed to clear tasks. Please try again.";
    UI.errorMessage.style.display = "block";
    console.error("Error clearing tasks:", error);
  }
});

UI.btnSeed.addEventListener("click", async () => {
  const sampleTasks = [
    {
      title: "Buy groceries",
      description: "Milk, Bread, Eggs, Fruits",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      title: "Finish project report",
      description: "Complete the final report for the frontend project",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      title: "Call the bank",
      description: "Inquire about the new credit card offers",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  try {
    const store = tx("tasks", "readwrite");
    for (const task of sampleTasks) {
      const newId = await idbRequestToPromise(store.add(task));
      tasks.unshift({ ...task, id: newId }); // نضيف التاسك الجديد في بداية المصفوفة
    }
    render();
    UI.toastMessage.textContent = "Sample tasks added! 🌱";
    UI.toastMessage.style.display = "block";
    setTimeout(() => {
      UI.toastMessage.style.display = "none";
    }, 3000); // نخفي رسالة النجاح بعد 3 ثواني
  } catch (error) {
    UI.errorMessage.textContent =
      "Failed to add sample tasks. Please try again.";
    UI.errorMessage.style.display = "block";
    console.error("Error adding sample tasks:", error);
  }
});

async function handleToggle(id) {
  // 1. ندور على التاسك في المصفوفة بتاعتنا
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return;

  const task = tasks[index];
  // 2. نعكس الحالة (لو done خليها pending، والعكس)
  const newStatus = task.status === "done" ? "pending" : "done";

  try {
    // 3. نحدث الداتابيز بالدالة النظيفة اللي لسه عاملينها
    const updatedTask = await updateTask(id, { status: newStatus });

    // 4. نحدث المصفوفة بتاعتنا
    tasks[index] = updatedTask;

    // 5. نرسم الشاشة من تاني
    render();

    // 6. نظهر رسالة النجاح (Toast)
    UI.toastMessage.textContent =
      newStatus === "done"
        ? "Task marked as done! ✅"
        : "Task marked as pending! ↩️";
    UI.toastMessage.style.display = "block";
    setTimeout(() => {
      UI.toastMessage.style.display = "none";
    }, 2500);
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function handleDelete(id) {
  // 1. ندور على التاسك عشان نجيب اسمه ونعرضه في رسالة التأكيد
  const taskToDel = tasks.find((t) => t.id === id);
  if (!taskToDel) return;

  // 2. نطلع رسالة تأكيد (Confirm) لليوزر
  if (!confirm(`Are you sure you want to delete:\n"${taskToDel.title}"?`)) {
    return; // لو داس Cancel، وقف الدالة ومتمسحش حاجة
  }

  try {
    // 3. نمسح من الداتابيز الأول
    await deleteTask(id);

    // 4. نمسح من المصفوفة بتاعتنا
    // (بنستخدم filter عشان نرجع كل المهام "ما عدا" المهمة اللي الـ ID بتاعها بيساوي اللي اتمسح)
    tasks = tasks.filter((t) => t.id !== id);

    // 5. نرسم الشاشة من تاني
    render();

    // 6. نظهر رسالة (Toast)
    UI.toastMessage.textContent = "Task deleted successfully! 🗑️";
    UI.toastMessage.style.display = "block";
    setTimeout(() => {
      UI.toastMessage.style.display = "none";
    }, 2500);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// مراقبة الكليكات جوه حاوية المهام كلها (Event Delegation)
UI.tasksContainer.addEventListener("click", (event) => {
  // بنشوف اليوزر داس على زرار ولا لأ
  const btn = event.target.closest("button");
  if (!btn) return;

  // بنجيب الكارت الأب عشان نقرأ منه الـ ID
  const card = event.target.closest(".task-card");
  if (!card) return;

  const id = Number(card.dataset.id); // حولنا الـ ID لرقم
  const action = btn.dataset.action; // بنقرا نوع الأكشن من الزرار

  // لو الزرار نوعه toggle، شغل الدالة
  if (action === "toggle") {
    handleToggle(id);
  }

  // لو الزرار نوعه delete، شغل الدالة
  if (action === "delete") {
    handleDelete(id);
  }
});

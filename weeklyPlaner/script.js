document.querySelectorAll(".day textarea").forEach((textarea) => {
  const dayId = textarea.parentElement.id;

  // Load saved data
  textarea.value = localStorage.getItem(dayId) || "";

  // Save on input
  textarea.addEventListener("input", () => {
    localStorage.setItem(dayId, textarea.value);
  });

  // Enable dragging selected text
  textarea.addEventListener("dragstart", (e) => {
    const selection = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    if (selection.trim()) {
      e.dataTransfer.setData("text/plain", selection);
      e.dataTransfer.setData("source-day", dayId);
      e.dataTransfer.setData("start", textarea.selectionStart.toString());
      e.dataTransfer.setData("end", textarea.selectionEnd.toString());
      e.dataTransfer.effectAllowed = "move"; // استفاده از copy به جای move
    } else {
      e.preventDefault();
    }
  });

  textarea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  textarea.addEventListener("drop", (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    const sourceDayId = e.dataTransfer.getData("source-day"); // ای دی مربوطه به مبدا هستش
    const start = parseInt(e.dataTransfer.getData("start"), 10);
    const end = parseInt(e.dataTransfer.getData("end"), 10);

    // Insert into current textarea
    const cursorPos = textarea.selectionStart;
    const currentValue = textarea.value;
    textarea.value =
      currentValue.slice(0, cursorPos) +
      droppedText +
      "\n" +
      currentValue.slice(cursorPos);

    const destDaYId = textarea.parentElement.id; // ای دی مربوط به مقصد
    localStorage.setItem(destDaYId, textarea.value);

    if (sourceDayId && sourceDayId !== destDaYId) {
      const source = document.querySelector(`#${sourceDayId} textarea`); //  :درواقع میخواهیم ای دی مربوط به المتتی که تکست اریا داخلش هست دسترسی پیدا کنیم یا بجاش میتونیم بنویسیم
      //const sourceId = document.getElementById(sourceDayId)
      //const sourseTextarea = sourceId.querySelector("textarea")
      const sourceText = source.value;
      source.value = sourceText.slice(0, start) + sourceText.slice(end);
      localStorage.setItem(sourceDayId, source.value);
    }

    // Save to localStorage
  });

  textarea.setAttribute("draggable", "true");
});

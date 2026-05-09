const input_name = document.getElementById("name");
const input_url = document.getElementById("url");
const btn_sumbit = document.getElementById("btn-submit");
const bookMarkList = document.getElementById("list");

const btn_remove = document.getElementById("btn-remove");

btn_sumbit.addEventListener("click", function (event) {
  event.preventDefault();

  const name = input_name.value.trim();
  const url = input_url.value.trim();

  if (name === "" || url === "") {
    alert("Please fill in both fields!");
    return;
  }

  let newListItem = document.createElement("li");
  newListItem.classList.add("bookmark-item");

  let link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.textContent = name;

  let removeBtn = document.createElement("button");
  removeBtn.innerHTML = "Remove";
  removeBtn.className = "btn-remove";

  newListItem.appendChild(link);
  newListItem.appendChild(removeBtn);
  bookMarkList.appendChild(newListItem);

  input_name.value = "";
  input_url.value = "";
});

bookMarkList.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-remove")) {
    // لو أيوة، هات الأب بتاعه (اللي هو سطر الـ li كله)
    const itemToRemove = e.target.parentElement;

    // وبعدين امسح السطر ده من القائمة
    bookMarkList.removeChild(itemToRemove);
  }
});

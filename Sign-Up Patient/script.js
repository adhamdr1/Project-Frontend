const form = document.getElementById("registrationForm");
const formCard = document.getElementById("formCard");
const mainArea = document.querySelector("main");

const phone = document.getElementById("phone");
const dob = document.getElementById("dob");
const today = new Date().toISOString().split("T")[0];
dob.max = today;

phone.addEventListener("input", function (event) {
  this.value = this.value.replace(/[^0-9+() -]/g, "");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(this);

  const patientData = Object.fromEntries(formData.entries());

  console.log("Data ready to send to .NET API:", patientData);
  showSuccessState();
});

function showSuccessState() {
  // 1. إخفاء الكارت الأبيض بتاع الفورم
  //   formCard.classList.add("hidden");
  formCard.style.display = "none";

  // 2. خلق كارت جديد لرسالة النجاح
  const successBox = document.createElement("div");

  // إعطاء الكارت الجديد نفس استايلات الكارت القديم عشان الشكل يبقى متناسق
  successBox.className = `
    bg-white p-10 border border-green-100 rounded-3xl shadow-xl 
    w-full max-w-2xl mx-auto flex-1 text-center flex flex-col items-center justify-center
  `;

  // 3. رسم المحتوى الداخلي للكارت (أيقونة، عنوان، زرار)
  successBox.innerHTML = `
    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
      <i class="fa-solid fa-check text-5xl text-green-500"></i>
    </div>
    
    <h2 class="text-3xl font-extrabold text-heading mb-3">Registration Successful!</h2>
    <p class="text-label mb-8 text-lg">The patient's digital record has been created securely.</p>
    
    <button id="registerAnotherBtn" class="bg-gray-100 hover:bg-gray-200 text-heading font-bold py-3 px-8 rounded-xl transition-all">
      Register Another Patient
    </button>
  `;

  // 4. حقن الكارت الجديد جوه الشاشة (في الـ main)
  mainArea.appendChild(successBox);

  // ==========================================
  // 5. برمجة زرار "تسجيل مريض آخر"
  // ==========================================
  document
    .getElementById("registerAnotherBtn")
    .addEventListener("click", function () {
      // أ. امسح كارت النجاح من الشاشة تماماً
      successBox.remove();

      // ب. رجّع كارت الفورم يظهر تاني
      //   formCard.classList.remove("hidden");
      formCard.style.display = "";

      // ج. فضّي كل الخانات اللي اليوزر كان كاتبها عشان يسجل مريض جديد على نظافة
      form.reset();
    });
}

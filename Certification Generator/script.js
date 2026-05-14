// input fields
const name_input = document.getElementById("name");
const course_input = document.getElementById("course");
const instructor_input = document.getElementById("instructor");
const signature_input = document.getElementById("file");
const date_input = document.getElementById("date");
const serial_input = document.getElementById("serial");

// Error Messages
const error_name = document.getElementById("error-name");
const error_course = document.getElementById("error-course");
const error_instructor = document.getElementById("error-instructor");
const error_signature = document.getElementById("error-file");
const error_date = document.getElementById("error-date");
const error_serial = document.getElementById("error-serial");

// buttons
const btn_Demo = document.getElementById("btn-demo");
const btn_Reset = document.getElementById("btn-reset");
const btn_Print = document.getElementById("btn-print");
const error_msg = document.getElementById("input-status");

// certificate fields
const status_print = document.getElementById("status-print");

// top section
const certificate_issued = document.getElementById("input-issued");
const certificate_Serial = document.getElementById("input-serial");

// middle section
const certificate_name = document.getElementById("input-student");
const certificate_course = document.getElementById("input-course");

// bottom section
const certificate_instructor = document.getElementById("input-instructor");
const certificate_signature = document.getElementById("signature-image");

const defaultSignatureSrc = "image/Sig1.png";

// Validation function
function validateName() {
  // بنجيب القيمة ونشيل المسافات الزايدة
  const nameValue = name_input.value.trim();

  if (nameValue.length < 3) {
    // لو غلط: نظهر رسالة الخطأ ونخلي البوردر أحمر
    error_name.style.display = "block";
    name_input.style.borderColor = "var(--color-error)";
    return false; // بنرجع false عشان نعرف بعدين إن الحقل ده بايظ
  } else {
    // لو صح: نخفي رسالة الخطأ ونرجع البوردر للونه الأصلي
    error_name.style.display = "none";
    name_input.style.borderColor = "var(--border-color)";
    return true; // بنرجع true يعني الحقل ده تمام وزي الفل
  }
}

function validateCourse() {
  const courseValue = course_input.value.trim();
  if (courseValue.length < 5) {
    error_course.style.display = "block";
    course_input.style.borderColor = "var(--color-error)";
    return false;
  } else {
    error_course.style.display = "none";
    course_input.style.borderColor = "var(--border-color)";
    return true;
  }
}

function validateInstructor() {
  const instructorValue = instructor_input.value.trim();
  if (instructorValue.length < 3) {
    error_instructor.style.display = "block";
    instructor_input.style.borderColor = "var(--color-error)";
    return false;
  } else {
    error_instructor.style.display = "none";
    instructor_input.style.borderColor = "var(--border-color)";
    return true;
  }
}

function validateDate() {
  const dateValue = date_input.value;
  if (!dateValue) {
    error_date.style.display = "block";
    date_input.style.borderColor = "var(--color-error)";
    return false;
  }
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    error_date.style.display = "block";
    date_input.style.borderColor = "var(--color-error)";
    return false;
  } else {
    error_date.style.display = "none";
    date_input.style.borderColor = "var(--border-color)";
    return true;
  }
}

function validateSerial() {
  const serialValue = serial_input.value.trim();
  const serialPattern = /^[a-zA-Z0-9\-]{6,}$/;
  if (!serialPattern.test(serialValue)) {
    error_serial.style.display = "block";
    serial_input.style.borderColor = "var(--color-error)";
    return false;
  } else {
    error_serial.style.display = "none";
    serial_input.style.borderColor = "var(--border-color)";
    return true;
  }
}

function validateSignature() {
  const file = signature_input.files[0];

  if (!file) {
    error_signature.style.display = "none";
    signature_input.style.borderColor = "var(--border-color)";
    return true; // عديها، هنستخدم الافتراضي
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!validTypes.includes(file.type)) {
    // لو ملف غلط (مثلاً PDF)
    error_signature.style.display = "block";
    signature_input.style.borderColor = "var(--color-error)";
    return false; // ارفض
  }

  // 3. لو في ملف ونوعه صورة صح
  error_signature.style.display = "none";
  signature_input.style.borderColor = "var(--border-color)";
  return true; // اقبل
}

function checkAllValid() {
  const isNameOk = name_input.value.trim().length >= 3;
  const isCourseOk = course_input.value.trim().length >= 5;
  const isInstructorOk = instructor_input.value.trim().length >= 3;
  const isDateOk = date_input.value !== "";

  const serialPattern = /^[a-zA-Z0-9\-]{6,}$/;
  const isSerialOk = serialPattern.test(serial_input.value.trim());

  const file = signature_input.files[0];
  const isSignatureOk =
    !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (
    isNameOk &&
    isCourseOk &&
    isInstructorOk &&
    isDateOk &&
    isSerialOk &&
    isSignatureOk
  ) {
    btn_Print.disabled = false;
    error_msg.style.display = "none";
    status_print.textContent = "✅ Ready to print";
  } else {
    btn_Print.disabled = true;
    error_msg.style.display = "block";
    status_print.textContent = "❌ Not ready to print";
  }
}

// 2. ربط كل مربع بالدالة بتاعته + تحديث الشهادة (Live Update)
name_input.addEventListener("input", () => {
  validateName();
  checkAllValid();
  // تحديث الشهادة
  certificate_name.textContent = name_input.value.trim() || "Student Name";
});

course_input.addEventListener("input", () => {
  validateCourse();
  checkAllValid();
  certificate_course.textContent =
    course_input.value.trim() || "Course Name Goes Here";
});

instructor_input.addEventListener("input", () => {
  validateInstructor();
  checkAllValid();
  certificate_instructor.textContent =
    instructor_input.value.trim() || "Instructor Name Goes Here";
});

date_input.addEventListener("input", () => {
  validateDate();
  checkAllValid();
  certificate_issued.textContent = date_input.value || "___";
});

serial_input.addEventListener("input", () => {
  // ماتنساش تعدل الباترن جوه دالة validateSerial نفسها برضه
  validateSerial();
  checkAllValid();
  certificate_Serial.textContent = serial_input.value.trim() || "___";
});

signature_input.addEventListener("change", () => {
  // 1. افحص الملف ولون المربع وخد النتيجة (صح ولا غلط)
  const isValid = validateSignature();

  // 2. طمن مدير الأمن (عشان يفتح أو يقفل زرار الطباعة)
  checkAllValid();

  // 3. نحدث الشهادة بقى
  if (isValid) {
    const file = signature_input.files[0];

    if (file) {
      // لو اليوزر رفع صورة سليمة، حولها للينك وهمي واعرضها
      const objectURL = URL.createObjectURL(file);
      certificate_signature.src = objectURL;
    } else {
      // لو اليوزر داس على الانبوت وبعدين عمل Cancel (يعني لغى الصورة)
      certificate_signature.src = defaultSignatureSrc; // نرجعه للافتراضي
    }
  } else {
    certificate_signature.src = defaultSignatureSrc;
  }
});

btn_Demo.addEventListener("click", () => {
  // set demo values
  name_input.value = "Adham Mohamed";
  course_input.value = "Node.js for Beginners";
  instructor_input.value = "Ahmed Ragab";
  date_input.value = "2024-06-01";
  serial_input.value = "ABC-123456";

  signature_input.value = "";
  certificate_signature.src = defaultSignatureSrc;

  // trigger input events to update certificate and validate
  name_input.dispatchEvent(new Event("input"));
  course_input.dispatchEvent(new Event("input"));
  instructor_input.dispatchEvent(new Event("input"));
  date_input.dispatchEvent(new Event("input"));
  serial_input.dispatchEvent(new Event("input"));

  checkAllValid();
});

btn_Reset.addEventListener("click", () => {
  // بنستخدم setTimeout عشان نأخر الكود جزء من الثانية لحد ما المتصفح يفضي الفورم الأول
  setTimeout(() => {
    // 1. نرجع نصوص الشهادة للوضع الافتراضي
    certificate_name.textContent = "Student Name";
    certificate_course.textContent = "Course Name Goes Here";
    certificate_instructor.textContent = "Instructor Name Goes Here";
    certificate_issued.textContent = "___";
    certificate_Serial.textContent = "___";
    certificate_signature.src = defaultSignatureSrc; // نرجع التوقيع الأصلي

    // 2. نخفي كل رسائل الخطأ
    error_name.style.display = "none";
    error_course.style.display = "none";
    error_instructor.style.display = "none";
    error_date.style.display = "none";
    error_serial.style.display = "none";
    error_signature.style.display = "none";

    // 3. نرجع كل البوردرز للون العادي
    name_input.style.borderColor = "var(--border-color)";
    course_input.style.borderColor = "var(--border-color)";
    instructor_input.style.borderColor = "var(--border-color)";
    date_input.style.borderColor = "var(--border-color)";
    serial_input.style.borderColor = "var(--border-color)";
    signature_input.style.borderColor = "var(--border-color)";

    // 4. نقفل زرار الطباعة لأن الفورم بقت فاضية
    checkAllValid();
  }, 0);
});

btn_Print.addEventListener("click", () => {
  window.print();
});

// /* ==============================================================
//    1. طبقة القوانين (Pure Logic - صامتة تماماً)
//    وظيفتها ترجع True لو سليم، و False لو غلط (من غير أي ألوان)
//    استخدمنا الـ Arrow Functions عشان تكون مختصرة وشيك
//    ============================================================== */
// const isNameValid = () => name_input.value.trim().length >= 3;
// const isCourseValid = () => course_input.value.trim().length >= 5;
// const isInstructorValid = () => instructor_input.value.trim().length >= 3;
// const isDateValid = () => date_input.value !== "";
// const isSerialValid = () => /^[a-zA-Z0-9\-]{6,}$/.test(serial_input.value.trim());

// const isSignatureValid = () => {
//     const file = signature_input.files[0];
//     return file && ["image/jpeg", "image/png", "image/webp"].includes(file.type);
// };

// /* ==============================================================
//    2. طبقة الـ UI (التعامل مع الألوان ورسائل الخطأ - Loud Check)
//    ============================================================== */
// function handleNameUI() {
//     if (isNameValid()) {
//         error_name.style.display = "none";
//         name_input.style.borderColor = "var(--border-color)";
//     } else {
//         error_name.style.display = "block";
//         name_input.style.borderColor = "var(--color-error)";
//     }
// }

// // (هتعمل نفس دالة الـ UI دي لباقي الحقول زي Course و Instructor...)

// /* ==============================================================
//    3. الفحص العام (مدير الأمن - Silent Check)
//    ============================================================== */
// function checkAllValid() {
//     // بص هنا الحلاوة! بننادي على نفس قوانين الفحص من غير تكرار
//     // ومن غير ما يشغلوا أي ألوان لأنهم دوال "نقية"
//     if (isNameValid() && isCourseValid() && isInstructorValid() &&
//         isDateValid() && isSerialValid() && isSignatureValid()) {

//         btn_Print.disabled = false;
//         error_msg.style.display = "none";
//         status_print.textContent = "✅ Ready to print";
//     } else {
//         btn_Print.disabled = true;
//         error_msg.style.display = "block";
//         status_print.textContent = "❌ Not ready to print";
//     }
// }

// /* ==============================================================
//    4. الأحداث (Events)
//    ============================================================== */
// name_input.addEventListener("input", () => {
//     handleNameUI(); // حدث شكل حقل الاسم بس (لون أحمر/عادي)
//     checkAllValid(); // طمن مدير الأمن على الباقي بصمت
//     certificate_name.textContent = name_input.value.trim() || "Student Name";
// });

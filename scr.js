const provinces = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cần Thơ",
  "Cao Bằng",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "TP. Hồ Chí Minh",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên - Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

// Danh sách các từ khóa viết tắt hoặc cách gọi khác
const aliases = {
  "TP. Hồ Chí Minh": ["hcm", "saigon", "sg"],
  "Thừa Thiên - Huế": ["hue"],
  "Bà Rịa - Vũng Tàu": ["brvt", "vungtau"],
};

let guessedProvinces = new Set();
let isGameOver = false;

const container = document.getElementById("cards-container");
const inputElement = document.getElementById("province-input");
const showBtn = document.getElementById("show-answer-btn");
const resetBtn = document.getElementById("reset-btn");
const guessedCountEl = document.getElementById("guessed-count");
const remainingCountEl = document.getElementById("remaining-count");
const toastEl = document.getElementById("toast");
const STORAGE_KEY = "guessed-provinces";

// Hàm chuẩn hóa chuỗi
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Tạo mảng chuẩn hóa có chứa cả các từ khóa phụ (aliases)
const normalizedProvinces = provinces.map((p) => ({
  original: p,
  normalized: normalizeString(p),
  aliases: aliases[p] ? aliases[p].map((a) => normalizeString(a)) : [],
}));

// Khởi tạo giao diện
function initGrid() {
  provinces.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = `card-${index}`;
    card.innerText = p;
    container.appendChild(card);
  });
}

function updateStats() {
  guessedCountEl.innerText = guessedProvinces.size;
  remainingCountEl.innerText = provinces.length - guessedProvinces.size;
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...guessedProvinces]));
}

function loadProgress() {
  const savedProgress = localStorage.getItem(STORAGE_KEY);
  if (!savedProgress) return;

  try {
    const savedProvinces = JSON.parse(savedProgress);
    if (!Array.isArray(savedProvinces)) return;

    savedProvinces.forEach((province) => {
      if (provinces.includes(province)) {
        guessedProvinces.add(province);
      }
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetGame() {
  localStorage.clear();
  guessedProvinces.clear();
  isGameOver = false;

  document.querySelectorAll(".card").forEach((card) => {
    card.classList.remove("correct", "missed");
  });

  inputElement.value = "";
  inputElement.disabled = false;
  updateStats();
  inputElement.focus();
}

function flashAlreadyGuessedCard(index) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  card.classList.remove("flash-red");
  void card.offsetWidth;
  card.classList.add("flash-red");

  setTimeout(() => {
    card.classList.remove("flash-red");
  }, 1000);
}

function showToast(message = "Đáp án sai") {
  toastEl.textContent = message;
  toastEl.classList.remove("show");
  void toastEl.offsetWidth;
  toastEl.classList.add("show");

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1500);
}

function checkAnswer(rawValue) {
  const value = (rawValue ?? inputElement.value).trim();
  const inputText = normalizeString(value);

  if (!inputText) {
    inputElement.value = "";
    return;
  }

  for (let i = 0; i < normalizedProvinces.length; i++) {
    const prov = normalizedProvinces[i];
    const isMatch =
      inputText === prov.normalized || prov.aliases.includes(inputText);

    if (!isMatch) continue;

    if (guessedProvinces.has(prov.original)) {
      flashAlreadyGuessedCard(i);
      showToast("Đáp án trùng lặp");
      inputElement.value = "";
      return;
    }

    guessedProvinces.add(prov.original);

    const card = document.getElementById(`card-${i}`);
    if (card) {
      card.classList.add("correct");
    }

    saveProgress();
    inputElement.value = "";
    updateStats();

    if (guessedProvinces.size === provinces.length) {
      alert("Chúc mừng! Bạn đã kể tên toàn bộ 63 tỉnh thành.");
      isGameOver = true;
    }

    return;
  }

  showToast("Đáp án sai");
  inputElement.value = "";
}

inputElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    checkAnswer(inputElement.value);
  }
});

// Xử lý sự kiện nhập liệu
inputElement.addEventListener("input", () => {
  if (isGameOver) return;

  // Không check ngay khi gõ từng chữ; chỉ check khi nhấn Enter
  if (inputElement.value.trim() === "") {
    inputElement.value = "";
  }
});

// Xử lý nút Show Answer
showBtn.addEventListener("click", () => {
  if (isGameOver) return;

  provinces.forEach((p, index) => {
    if (!guessedProvinces.has(p)) {
      const card = document.getElementById(`card-${index}`);
      card.classList.add("missed");
    }
  });

  isGameOver = true;
  inputElement.disabled = true;
});

initGrid();
loadProgress();
guessedProvinces.forEach((province) => {
  const index = provinces.indexOf(province);
  const card = document.getElementById(`card-${index}`);
  if (card) card.classList.add("correct");
});
updateStats();

if (guessedProvinces.size === provinces.length) {
  isGameOver = true;
  inputElement.disabled = true;
}

resetBtn.addEventListener("click", resetGame);

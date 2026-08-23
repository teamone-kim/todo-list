import { supabase } from "./supabaseClient.js";

const authScreen = document.getElementById("auth-screen");
const boardScreen = document.getElementById("board");
const userInfo = document.getElementById("user-info");
const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authError = document.getElementById("auth-error");
const authMessage = document.getElementById("auth-message");
const showSignupLink = document.getElementById("show-signup");
const showLoginLink = document.getElementById("show-login");

let onAuthChangeCallback = null;

export function setOnAuthChange(callback) {
  onAuthChangeCallback = callback;
}

function clearAuthMessages() {
  authError.textContent = "";
  authMessage.textContent = "";
}

function toggleForms(showSignup) {
  clearAuthMessages();
  loginForm.style.display = showSignup ? "none" : "";
  signupForm.style.display = showSignup ? "" : "none";
  showSignupLink.style.display = showSignup ? "none" : "";
  showLoginLink.style.display = showSignup ? "" : "none";
}

function showAuthScreen() {
  authScreen.style.display = "";
  boardScreen.style.display = "none";
  userInfo.style.display = "none";
}

function showBoardScreen(user) {
  authScreen.style.display = "none";
  boardScreen.style.display = "";
  userInfo.style.display = "";
  userEmailEl.textContent = user.email;
}

function handleAuthState(session) {
  if (session?.user) {
    showBoardScreen(session.user);
    onAuthChangeCallback?.(session.user);
  } else {
    showAuthScreen();
    onAuthChangeCallback?.(null);
  }
}

showSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms(true);
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms(false);
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAuthMessages();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authError.textContent = error.message;
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAuthMessages();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    authError.textContent = error.message;
    return;
  }
  if (!data.session) {
    authMessage.textContent = "가입 확인 이메일을 보냈습니다. 이메일 인증 후 로그인해주세요.";
    toggleForms(false);
  }
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
});

supabase.auth.getSession().then(({ data: { session } }) => handleAuthState(session));
supabase.auth.onAuthStateChange((_event, session) => handleAuthState(session));

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnf5ngoBldbb19QhU5s5EclP6P3ouUdIw",
  authDomain: "nosql-web-application.firebaseapp.com",
  projectId: "nosql-web-application",
  storageBucket: "nosql-web-application.firebasestorage.app",
  messagingSenderId: "128101337608",
  appId: "1:128101337608:web:8294fa120ec34e4c8b5fbd",
  measurementId: "G-C11630GDCW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const notesCollection = collection(db, "sticky_notes");

const TRANSLATIONS = {
  en: {
    appTitle: "📌 Interactive Group Sticky Notes",
    loginSubtitle: "Please log in to view and post on the board",
    boardSubtitle: "Click a sticker to react, or manage your notes below",
    settingsBtn: "Settings",
    settingsHeading: "⚙️ System Settings",
    avatarLabel: "Profile Avatar",
    changePasswordLabel: "Change Personal Password",
    themeMode: "Appearance Mode",
    accentColor: "Accent & Interface Theme",
    language: "Language",
    gridSize: "Board Card Size",
    stickerAnim: "Enable interactive sticker bounce on hover",
    forgotPassword: "Forgot password?",
    resetHeading: "Reset Password via Gmail / Email",
    resetDesc: "Enter your Gmail/email address (or username) and we will send a password reset link.",
    sendLink: "Send Link",
    backToLogin: "Back to Login",
    creatorHeading: "Create Interactive Sticky Note",
    chooseSticker: "Choose a Sticker:",
    colorLabel: "Color:",
    tiltLabel: "Tilt:",
    submitBtn: "Stick to Board"
  },
  tl: {
    appTitle: "📌 Interactive Group Sticky Notes",
    loginSubtitle: "Mag-login muna upang makita at mag-post sa board",
    boardSubtitle: "I-click ang sticker para mag-react o pamahalaan ang iyong mga note",
    settingsBtn: "Mga Setting",
    settingsHeading: "⚙️ Mga Setting ng System",
    avatarLabel: "Avatar ng Profile",
    changePasswordLabel: "Palitan ang Personal na Password",
    themeMode: "Mode ng Hitsura",
    accentColor: "Kulay ng Tema",
    language: "Wika",
    gridSize: "Laki ng Card sa Board",
    stickerAnim: "I-on ang animation ng sticker kapag tinatapatan",
    forgotPassword: "Nakalimutan ang password?",
    resetHeading: "I-reset ang Password gamit ang Gmail / Email",
    resetDesc: "Ilagay ang iyong Gmail/email (o username) upang magpadala ng password reset link.",
    sendLink: "Ipadala",
    backToLogin: "Bumalik sa Login",
    creatorHeading: "Gumawa ng Interactive Sticky Note",
    chooseSticker: "Pumili ng Sticker:",
    colorLabel: "Kulay:",
    tiltLabel: "Hilig:",
    submitBtn: "I-post sa Board"
  },
  hil: {
    appTitle: "📌 Interactive Group Sticky Notes",
    loginSubtitle: "Mag-login anay agud makita kag maka-post sa board",
    boardSubtitle: "I-click ang sticker agud mag-react ukon dumalahan ang imo mga note sa idalom",
    settingsBtn: "Mga Setting",
    settingsHeading: "⚙️ Mga Setting sang System",
    avatarLabel: "Avatar sang Profile",
    changePasswordLabel: "Ilisan ang Personal nga Password",
    themeMode: "Hitsura sang Screen",
    accentColor: "Duag sang Tema",
    language: "Lengguwahe",
    gridSize: "Kadakuon sang Card sa Board",
    stickerAnim: "I-on ang hulag sang sticker kon itudlo",
    forgotPassword: "Nalipatan ang password?",
    resetHeading: "I-reset ang Password paagi sa Gmail / Email",
    resetDesc: "Isulod ang imo Gmail/email (ukon username) agud padal-an ka sang password reset link.",
    sendLink: "Ipadala",
    backToLogin: "Balik sa Login",
    creatorHeading: "Maghimo sang Interactive Sticky Note",
    chooseSticker: "Magpili sang Sticker:",
    colorLabel: "Duag:",
    tiltLabel: "Hilig:",
    submitBtn: "Ipapilit sa Board"
  },
  ceb: {
    appTitle: "📌 Interactive Group Sticky Notes",
    loginSubtitle: "Pag-login una aron makita ug maka-post sa board",
    boardSubtitle: "I-click ang sticker aron mo-react o dumalahon ang imong mga note sa ubos",
    settingsBtn: "Mga Setting",
    settingsHeading: "⚙️ Mga Setting sa System",
    avatarLabel: "Avatar sa Profile",
    changePasswordLabel: "Ilisan ang Personal nga Password",
    themeMode: "Hitsura sa Screen",
    accentColor: "Kolor sa Tema",
    language: "Pinulongan",
    gridSize: "Gidak-on sa Card sa Board",
    stickerAnim: "I-on ang lihok sa sticker kon itudlo",
    forgotPassword: "Nakalimot sa password?",
    resetHeading: "I-reset ang Password gamit ang Gmail / Email",
    resetDesc: "Isulod ang imong Gmail/email (o username) aron padad-an ka og password reset link.",
    sendLink: "Ipadala",
    backToLogin: "Balik sa Login",
    creatorHeading: "Paghimo og Interactive Sticky Note",
    chooseSticker: "Pagpili og Sticker:",
    colorLabel: "Kolor:",
    tiltLabel: "Hilig:",
    submitBtn: "Ipapilit sa Board"
  }
};

const DEFAULT_SETTINGS = {
  avatar: "😎",
  themeMode: "light",
  accent: "blue",
  language: "en",
  gridSize: "normal",
  stickerAnim: true
};

// DOM Elements - Header & Settings
const appTitle = document.getElementById("appTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const settingsBtnLabel = document.getElementById("settingsBtnLabel");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const settingsHeading = document.getElementById("settingsHeading");
const labelAvatar = document.getElementById("labelAvatar");
const avatarPicker = document.getElementById("avatarPicker");

const passwordChangeSection = document.getElementById("passwordChangeSection");
const labelChangePassword = document.getElementById("labelChangePassword");
const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
const passwordStatusMsg = document.getElementById("passwordStatusMsg");

const labelThemeMode = document.getElementById("labelThemeMode");
const themeModeSelect = document.getElementById("themeModeSelect");
const labelAccentColor = document.getElementById("labelAccentColor");
const accentSwatches = document.getElementById("accentSwatches");
const labelLanguage = document.getElementById("labelLanguage");
const languageSelect = document.getElementById("languageSelect");
const labelGridSize = document.getElementById("labelGridSize");
const gridSizeSelect = document.getElementById("gridSizeSelect");
const labelStickerAnim = document.getElementById("labelStickerAnim");
const stickerAnimToggle = document.getElementById("stickerAnimToggle");

// DOM Elements - Auth & Reset Password
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userRoleBtn = document.getElementById("userRoleBtn");
const adminRoleBtn = document.getElementById("adminRoleBtn");
const authTabs = document.getElementById("authTabs");
const showLoginTab = document.getElementById("showLoginTab");
const showSignupTab = document.getElementById("showSignupTab");
const adminNotice = document.getElementById("adminNotice");
const socialAuthBlock = document.getElementById("socialAuthBlock");

const authForm = document.getElementById("authForm");
const nameInput = document.getElementById("nameInput");
const signupUsernameInput = document.getElementById("signupUsernameInput");
const loginIdentifierInput = document.getElementById("loginIdentifierInput");
const signupEmailInput = document.getElementById("signupEmailInput");
const passwordInput = document.getElementById("passwordInput");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");

const forgotPasswordRow = document.getElementById("forgotPasswordRow");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const resetPasswordBox = document.getElementById("resetPasswordBox");
const resetHeading = document.getElementById("resetHeading");
const resetDesc = document.getElementById("resetDesc");
const resetEmailInput = document.getElementById("resetEmailInput");
const sendResetBtn = document.getElementById("sendResetBtn");
const cancelResetBtn = document.getElementById("cancelResetBtn");

const googleBtn = document.getElementById("googleBtn");
const logoutBtn = document.getElementById("logoutBtn");

// DOM Elements - App
const userAvatarBadge = document.getElementById("userAvatarBadge");
const roleBadge = document.getElementById("roleBadge");
const userDisplayName = document.getElementById("userDisplayName");
const userHandleWrap = document.getElementById("userHandleWrap");
const userHandle = document.getElementById("userHandle");
const userEmail = document.getElementById("userEmail");
const creatorHeading = document.getElementById("creatorHeading");
const chooseStickerLabel = document.getElementById("chooseStickerLabel");
const colorLabel = document.getElementById("colorLabel");
const tiltLabel = document.getElementById("tiltLabel");
const submitBtn = document.getElementById("submitBtn");

const noteForm = document.getElementById("noteForm");
const contentInput = document.getElementById("contentInput");
const colorSelect = document.getElementById("colorSelect");
const tiltSelect = document.getElementById("tiltSelect");
const stickerOptions = document.getElementById("stickerOptions");
const searchInput = document.getElementById("searchInput");
const filterOwnership = document.getElementById("filterOwnership");
const notesBoard = document.getElementById("notesBoard");

// State
let settings = loadLocalSettings();
let selectedLoginRole = "user";
let isSignupMode = false;
let currentUser = null;
let currentUserRole = "user";
let currentUsername = "";
let selectedSticker = "📌";
let latestDocs = [];
let unsubscribeNotes = null;

// ==================== SETTINGS LOGIC ====================
function loadLocalSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("sticky_settings_v1"));
    return { ...DEFAULT_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettings(nextSettings) {
  settings = { ...DEFAULT_SETTINGS, ...nextSettings };
  localStorage.setItem("sticky_settings_v1", JSON.stringify(settings));

  document.body.classList.toggle("theme-dark", settings.themeMode === "dark");
  document.body.classList.remove("accent-blue", "accent-green", "accent-pink", "accent-amber");
  document.body.classList.add(`accent-${settings.accent}`);

  document.body.classList.remove("grid-compact", "grid-large");
  if (settings.gridSize === "compact") document.body.classList.add("grid-compact");
  if (settings.gridSize === "large") document.body.classList.add("grid-large");

  document.body.classList.toggle("sticker-anim", Boolean(settings.stickerAnim));

  userAvatarBadge.textContent = settings.avatar || DEFAULT_SETTINGS.avatar;
  document.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.avatar === settings.avatar);
  });

  themeModeSelect.value = settings.themeMode;
  languageSelect.value = settings.language;
  gridSizeSelect.value = settings.gridSize;
  stickerAnimToggle.checked = Boolean(settings.stickerAnim);

  document.querySelectorAll(".swatch-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.accent === settings.accent);
  });

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  appTitle.textContent = t.appTitle;
  headerSubtitle.textContent = currentUser ? t.boardSubtitle : t.loginSubtitle;
  settingsBtnLabel.textContent = t.settingsBtn;
  settingsHeading.textContent = t.settingsHeading;
  labelAvatar.textContent = t.avatarLabel;
  labelChangePassword.textContent = t.changePasswordLabel;
  labelThemeMode.textContent = t.themeMode;
  labelAccentColor.textContent = t.accentColor;
  labelLanguage.textContent = t.language;
  labelGridSize.textContent = t.gridSize;
  labelStickerAnim.textContent = t.stickerAnim;
  forgotPasswordBtn.textContent = t.forgotPassword;
  resetHeading.textContent = t.resetHeading;
  resetDesc.textContent = t.resetDesc;
  sendResetBtn.textContent = t.sendLink;
  cancelResetBtn.textContent = t.backToLogin;
  creatorHeading.textContent = t.creatorHeading;
  chooseStickerLabel.textContent = t.chooseSticker;
  colorLabel.textContent = t.colorLabel;
  tiltLabel.textContent = t.tiltLabel;
  submitBtn.textContent = t.submitBtn;
}

async function persistSettingsToFirestore() {
  if (!currentUser) return;
  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      settings,
      avatar: settings.avatar
    });
  } catch {
    // Ignore if user doc isn't created yet
  }
}

function setPasswordStatus(msg, isSuccess = false) {
  passwordStatusMsg.textContent = msg;
  passwordStatusMsg.style.color = isSuccess ? "#16a34a" : "#ef4444";
}

function syncPasswordSectionVisibility() {
  if (currentUser && hasPasswordProvider(currentUser)) {
    passwordChangeSection.classList.remove("hidden");
  } else {
    passwordChangeSection.classList.add("hidden");
  }
}

openSettingsBtn.addEventListener("click", () => {
  passwordStatusMsg.textContent = "";
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  syncPasswordSectionVisibility();
  settingsModal.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));

saveSettingsBtn.addEventListener("click", async () => {
  settingsModal.classList.add("hidden");
  await persistSettingsToFirestore();
});

settingsModal.addEventListener("click", async (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
    await persistSettingsToFirestore();
  }
});

avatarPicker.addEventListener("click", async (e) => {
  const btn = e.target.closest(".avatar-btn");
  if (!btn) return;
  applySettings({ ...settings, avatar: btn.dataset.avatar });
  await persistSettingsToFirestore();
});

updatePasswordBtn.addEventListener("click", async () => {
  if (!currentUser || !currentUser.email) return;

  const currentPass = currentPasswordInput.value;
  const newPass = newPasswordInput.value;

  if (!currentPass || !newPass) {
    setPasswordStatus("Please fill in both your current password and new password.");
    return;
  }
  if (newPass.length < 6) {
    setPasswordStatus("New password must be at least 6 characters.");
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    setPasswordStatus("Personal password updated successfully!", true);
  } catch (error) {
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      setPasswordStatus("Current password is incorrect.");
    } else {
      setPasswordStatus(error.message);
    }
  }
});

themeModeSelect.addEventListener("change", () => applySettings({ ...settings, themeMode: themeModeSelect.value }));
accentSwatches.addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch-btn");
  if (btn) applySettings({ ...settings, accent: btn.dataset.accent });
});
languageSelect.addEventListener("change", () => applySettings({ ...settings, language: languageSelect.value }));
gridSizeSelect.addEventListener("change", () => applySettings({ ...settings, gridSize: gridSizeSelect.value }));
stickerAnimToggle.addEventListener("change", () => applySettings({ ...settings, stickerAnim: stickerAnimToggle.checked }));
resetSettingsBtn.addEventListener("click", async () => {
  applySettings(DEFAULT_SETTINGS);
  await persistSettingsToFirestore();
});

applySettings(settings);

// ==================== AUTH & PASSWORD RESET ====================
function sanitizeUsername(raw) {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function setAuthStatus(message, isSuccess = false) {
  authMessage.textContent = message;
  authMessage.style.color = isSuccess ? "#16a34a" : "#ef4444";
}

userRoleBtn.addEventListener("click", () => {
  selectedLoginRole = "user";
  userRoleBtn.classList.add("active");
  adminRoleBtn.classList.remove("active");
  authTabs.classList.remove("hidden");
  adminNotice.classList.add("hidden");
  socialAuthBlock.classList.remove("hidden");
  resetPasswordBox.classList.add("hidden");
  setAuthStatus("");
  updateAuthFormUI();
});

adminRoleBtn.addEventListener("click", () => {
  selectedLoginRole = "admin";
  isSignupMode = false;
  adminRoleBtn.classList.add("active");
  userRoleBtn.classList.remove("active");
  authTabs.classList.add("hidden");
  adminNotice.classList.remove("hidden");
  socialAuthBlock.classList.add("hidden");
  resetPasswordBox.classList.add("hidden");
  setAuthStatus("");
  updateAuthFormUI();
});

showLoginTab.addEventListener("click", () => {
  isSignupMode = false;
  showLoginTab.classList.add("active");
  showSignupTab.classList.remove("active");
  resetPasswordBox.classList.add("hidden");
  setAuthStatus("");
  updateAuthFormUI();
});

showSignupTab.addEventListener("click", () => {
  if (selectedLoginRole === "admin") return;
  isSignupMode = true;
  showSignupTab.classList.add("active");
  showLoginTab.classList.remove("active");
  resetPasswordBox.classList.add("hidden");
  setAuthStatus("");
  updateAuthFormUI();
});

function updateAuthFormUI() {
  const signingUpUser = selectedLoginRole === "user" && isSignupMode;

  nameInput.classList.toggle("hidden", !signingUpUser);
  nameInput.required = signingUpUser;

  signupUsernameInput.classList.toggle("hidden", !signingUpUser);
  signupUsernameInput.required = signingUpUser;

  signupEmailInput.classList.toggle("hidden", !signingUpUser);
  signupEmailInput.required = signingUpUser;

  loginIdentifierInput.classList.toggle("hidden", signingUpUser);
  loginIdentifierInput.required = !signingUpUser;

  forgotPasswordRow.classList.toggle("hidden", signingUpUser);
  passwordInput.required = true;

  if (selectedLoginRole === "admin") {
    authSubmitBtn.textContent = "Log In as Admin";
  } else if (isSignupMode) {
    authSubmitBtn.textContent = "Create New User Account";
  } else {
    authSubmitBtn.textContent = "Log In as User";
  }
}

updateAuthFormUI();

forgotPasswordBtn.addEventListener("click", () => {
  resetPasswordBox.classList.remove("hidden");
  if (loginIdentifierInput.value.trim()) {
    resetEmailInput.value = loginIdentifierInput.value.trim();
  }
  setAuthStatus("");
});

cancelResetBtn.addEventListener("click", () => {
  resetPasswordBox.classList.add("hidden");
  setAuthStatus("");
});

sendResetBtn.addEventListener("click", async () => {
  const rawInput = resetEmailInput.value.trim();
  if (!rawInput) {
    setAuthStatus("Please enter your Gmail/email address or username first.");
    return;
  }

  try {
    const targetEmail = await resolveEmailFromIdentifier(rawInput);
    await sendPasswordResetEmail(auth, targetEmail);
    setAuthStatus(
      `Password reset link sent to ${targetEmail}. Check your Gmail/email inbox (and spam folder).`,
      true
    );
  } catch (error) {
    setAuthStatus(error.message);
  }
});

function hasPasswordProvider(user) {
  return Boolean(user && user.providerData.some((provider) => provider.providerId === "password"));
}

async function resolveEmailFromIdentifier(identifier) {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  const uname = sanitizeUsername(trimmed);
  if (!isValidUsername(uname)) {
    throw new Error("Enter a valid email address or username (3-20 letters, numbers, or _).");
  }
  const unameSnap = await getDoc(doc(db, "usernames", uname));
  if (!unameSnap.exists() || !unameSnap.data().email) {
    throw new Error("No account found with that username.");
  }
  return unameSnap.data().email;
}

async function syncUserToFirestore(user, providerName, customName = "", customUsername = "") {
  const userRef = doc(db, "users", user.uid);
  const existingSnap = await getDoc(userRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : {};

  const resolvedName =
    customName.trim() ||
    existingData.fullName ||
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "User");

  if (user.displayName !== resolvedName) {
    await updateProfile(user, { displayName: resolvedName });
  }

  let finalUsername = existingData.username || "";
  if (customUsername) {
    const cleanUname = sanitizeUsername(customUsername);
    if (!isValidUsername(cleanUname)) {
      throw new Error("Username must be 3-20 characters (letters, numbers, or underscores).");
    }
    const unameRef = doc(db, "usernames", cleanUname);
    const unameSnap = await getDoc(unameRef);
    if (unameSnap.exists() && unameSnap.data().uid !== user.uid) {
      throw new Error("That username is already taken.");
    }
    await setDoc(unameRef, {
      uid: user.uid,
      username: cleanUname,
      email: user.email || "",
      createdAt: serverTimestamp()
    });
    finalUsername = cleanUname;
  }

  if (!existingSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName: resolvedName,
      username: finalUsername,
      email: user.email || "",
      provider: providerName,
      role: "user",
      avatar: settings.avatar,
      settings,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });
    return { role: "user", username: finalUsername, savedSettings: settings };
  } else {
    const updates = { lastLoginAt: serverTimestamp() };
    if (finalUsername && !existingData.username) {
      updates.username = finalUsername;
    }
    await updateDoc(userRef, updates);
    return {
      role: existingData.role || "user",
      username: finalUsername,
      savedSettings: existingData.settings || settings
    };
  }
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setAuthStatus("");

  const password = passwordInput.value;

  try {
    if (isSignupMode) {
      if (selectedLoginRole === "admin") {
        throw new Error("Admin accounts cannot be created here.");
      }
      const fullName = nameInput.value.trim();
      const email = signupEmailInput.value.trim().toLowerCase();
      const uname = sanitizeUsername(signupUsernameInput.value);

      if (!isValidUsername(uname)) {
        throw new Error("Username must be 3-20 characters (letters, numbers, or underscores).");
      }

      const unameSnap = await getDoc(doc(db, "usernames", uname));
      if (unameSnap.exists()) {
        throw new Error("That username is already taken. Please choose another.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await syncUserToFirestore(cred.user, "password", fullName, uname);
    } else {
      const emailToUse = await resolveEmailFromIdentifier(loginIdentifierInput.value);
      const cred = await signInWithEmailAndPassword(auth, emailToUse, password);
      const profile = await syncUserToFirestore(cred.user, "password");

      if (selectedLoginRole === "admin") {
        if (profile.role !== "admin") {
          await signOut(auth);
          throw new Error("Access denied: This account does not have Admin privileges.");
        }
        if (!hasPasswordProvider(cred.user)) {
          await signOut(auth);
          throw new Error("Admin login requires an account with an Email and Password.");
        }
      }
    }
    authForm.reset();
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      setAuthStatus(
        "This email already has an account. Switch to 'Log In' or sign in with Gmail (Google)."
      );
    } else {
      setAuthStatus(error.message);
    }
  }
});

googleBtn.addEventListener("click", async () => {
  if (selectedLoginRole === "admin") {
    setAuthStatus("Admins must log in with Email and Password.");
    return;
  }
  setAuthStatus("");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserToFirestore(result.user, "google");
  } catch (error) {
    setAuthStatus(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  if (user) {
    currentUser = user;
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};
    currentUserRole = userData.role || "user";
    currentUsername = userData.username || "";

    const mergedSettings = {
      ...(userData.settings || {}),
      avatar: userData.avatar || (userData.settings && userData.settings.avatar) || settings.avatar
    };
    applySettings(mergedSettings);

    if (currentUserRole === "admin" && !hasPasswordProvider(user)) {
      await signOut(auth);
      setAuthStatus("Admin accounts must use Email and Password authentication.");
      return;
    }

    if (selectedLoginRole === "admin" && currentUserRole !== "admin") {
      await signOut(auth);
      return;
    }

    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    headerSubtitle.textContent = (TRANSLATIONS[settings.language] || TRANSLATIONS.en).boardSubtitle;

    userDisplayName.textContent = user.displayName || "User";
    userEmail.textContent = user.email || "Gmail Account";

    if (currentUsername) {
      userHandle.textContent = currentUsername;
      userHandleWrap.classList.remove("hidden");
    } else {
      userHandleWrap.classList.add("hidden");
    }

    if (currentUserRole === "admin") {
      roleBadge.textContent = "ADMIN";
      roleBadge.className = "badge badge-admin";
    } else {
      roleBadge.textContent = "USER";
      roleBadge.className = "badge badge-user";
    }

    syncPasswordSectionVisibility();
    startListeningToNotes();
  } else {
    currentUser = null;
    currentUserRole = "user";
    currentUsername = "";
    latestDocs = [];
    notesBoard.innerHTML = "";
    passwordChangeSection.classList.add("hidden");

    if (unsubscribeNotes) {
      unsubscribeNotes();
      unsubscribeNotes = null;
    }

    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    headerSubtitle.textContent = t.loginSubtitle;
  }
});

// ==================== STICKY NOTES & STICKERS ====================
stickerOptions.addEventListener("click", (e) => {
  const btn = e.target.closest(".sticker-choice");
  if (!btn) return;

  document.querySelectorAll(".sticker-choice").forEach((el) => el.classList.remove("selected"));
  btn.classList.add("selected");
  selectedSticker = btn.dataset.sticker;
});

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const content = contentInput.value.trim();
  const color = colorSelect.value;
  const tilt = tiltSelect.value;
  if (!content) return;

  const namePart = currentUsername
    ? `${userDisplayName.textContent} (@${currentUsername})`
    : (userDisplayName.textContent || userEmail.textContent || "User");
  const displayAuthor = `${settings.avatar || "😎"} ${namePart}`;

  try {
    await addDoc(notesCollection, {
      authorId: currentUser.uid,
      author: displayAuthor,
      content,
      color,
      sticker: selectedSticker,
      tilt,
      likes: [],
      createdAt: serverTimestamp()
    });
    contentInput.value = "";
  } catch (error) {
    console.error("Error adding note:", error);
    alert("Failed to post sticky note.");
  }
});

function startListeningToNotes() {
  if (unsubscribeNotes) unsubscribeNotes();
  const q = query(notesCollection, orderBy("createdAt", "desc"));

  unsubscribeNotes = onSnapshot(q, (snapshot) => {
    latestDocs = snapshot.docs;
    renderNotes();
  });
}

searchInput.addEventListener("input", renderNotes);
filterOwnership.addEventListener("change", renderNotes);

function renderNotes() {
  notesBoard.innerHTML = "";
  if (!currentUser) return;

  const searchTerm = searchInput.value.toLowerCase().trim();
  const ownershipFilter = filterOwnership.value;

  latestDocs.forEach((docSnapshot) => {
    const note = docSnapshot.data();
    const noteId = docSnapshot.id;

    const isOwner = currentUser.uid === note.authorId;
    const isAdmin = currentUserRole === "admin";
    const canModify = isOwner || isAdmin;

    if (ownershipFilter === "mine" && !isOwner) return;
    if (
      searchTerm &&
      !note.content.toLowerCase().includes(searchTerm) &&
      !note.author.toLowerCase().includes(searchTerm)
    ) {
      return;
    }

    const likes = Array.isArray(note.likes) ? note.likes : [];
    const hasLiked = likes.includes(currentUser.uid);

    const noteCard = document.createElement("div");
    noteCard.classList.add("sticky-note");
    noteCard.style.backgroundColor = note.color || "#fff740";
    noteCard.style.transform = `rotate(${note.tilt || "0deg"})`;

    const actionsHTML = canModify
      ? `
        <div class="note-actions">
          <button type="button" class="edit-btn">Edit</button>
          <button type="button" class="delete-btn">Delete</button>
        </div>
      `
      : "";

    noteCard.innerHTML = `
      <span class="note-sticker" title="Interactive Sticker">${escapeHTML(note.sticker || "📌")}</span>
      <p class="note-content">${escapeHTML(note.content)}</p>
      <div>
        <div class="note-meta">
          <button type="button" class="like-btn ${hasLiked ? "liked" : ""}">
            👍 ${likes.length}
          </button>
        </div>
        <div class="note-footer">
          <span><strong>- ${escapeHTML(note.author)}</strong></span>
          ${actionsHTML}
        </div>
      </div>
    `;

    noteCard.querySelector(".like-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike(noteId, hasLiked);
    });

    if (canModify) {
      noteCard.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        editNote(noteId, note.content);
      });
      noteCard.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteNote(noteId);
      });
    }

    notesBoard.appendChild(noteCard);
  });
}

async function toggleLike(id, hasLiked) {
  if (!currentUser) return;
  const noteRef = doc(db, "sticky_notes", id);
  try {
    await updateDoc(noteRef, {
      likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

async function editNote(id, currentContent) {
  const newContent = prompt("Edit sticky note:", currentContent);
  if (newContent !== null && newContent.trim() !== "") {
    try {
      await updateDoc(doc(db, "sticky_notes", id), {
        content: newContent.trim()
      });
    } catch (error) {
      console.error("Error updating note:", error);
      alert("You do not have permission to edit this note.");
    }
  }
}

async function deleteNote(id) {
  if (confirm("Are you sure you want to remove this sticky note?")) {
    try {
      await deleteDoc(doc(db, "sticky_notes", id));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("You do not have permission to delete this note.");
    }
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
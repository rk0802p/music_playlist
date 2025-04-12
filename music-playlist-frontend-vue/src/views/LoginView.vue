<template>
  <div class="login-wrapper">
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p>
        Don't have an account?
        <router-link to="/signup">Sign up here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = "";
  loading.value = true;

  try {
    await authStore.login(email.value, password.value);
    router.push("/");
  } catch (err) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value = "Login failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

* {
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  background: #0a0a12;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(170, 0, 255, 0.1) 0%, transparent 30%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #ffffff;
  animation: fadeIn 0.8s ease;
}

.login {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: rgba(16, 16, 24, 0.6);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 43, 226, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.login:hover {
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
  transform: translateY(-2px);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(45deg, #8a2be2, #ff00ff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input {
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 1rem;
  color: #ffffff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

input:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
}

button {
  padding: 0.8rem;
  background: linear-gradient(45deg, #8a2be2, #4a00e0);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
}

button:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

p {
  text-align: center;
  margin-top: 1.5rem;
  color: #aaaacc;
}

p a {
  color: #8a2be2;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

p a:hover {
  color: #ff00ff;
}

.error {
  text-align: center;
  margin-top: 1rem;
  color: #ff3366;
  font-weight: 600;
}

/* Animations */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
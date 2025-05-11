<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar v-if="isLoggedIn" />
    
    <div class="container mx-auto px-4 py-8">
      <router-view />
    </div>
    
    <footer class="bg-white p-4 shadow-inner mt-8">
      <div class="container mx-auto text-center text-gray-600">
        <p>© 2023 Bakery Planner. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import Navbar from './components/common/Navbar.vue';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isAuthenticated);
const router = useRouter();

// Vérifier l'authentification au chargement
if (!authStore.isAuthenticated) {
  router.push('/login');
}
</script>

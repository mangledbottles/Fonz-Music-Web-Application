<template>
  <header class="site-header">
    <div class="info-box">
        as of 2021, we've unfortunately decided to wrap up things at fonz music. thank you for everything!
      </div>
    <!-- <c-sale-banner v-if="checkIrish()"/> -->
    <div class="container">

      <div class="site-header-inner">

        <router-link class="header-logo" to="/">
          <img src="@/assets/images/logo.svg" alt="logo" style="padding: 5px 0px 5px 0px;"/>
        </router-link>

        <button
          v-if="!hideNav"
          ref="hamburger"
          class="header-nav-toggle"
          aria-controls="primary-menu"
          :aria-expanded="isActive ? 'true' : 'false'"
          @click="isActive ? closeMenu() : openMenu()"
        >
          <span class="screen-reader">Menu</span>
          <span class="hamburger">
            <span class="hamburger-inner"></span>
          </span>
        </button>
        <nav
          v-if="!hideNav"
          ref="nav"
          class="header-nav"
          :class="{ 'is-active': isActive }"
        >
          <div class="header-nav-inner">
            <ul
              class="list-reset text-xxs"
              :class="navPosition && `header-nav-${navPosition}`"
            >
              <li>
                <router-link to="/buy/"> buy </router-link>
              </li>
            </ul>
            <ul
              class="list-reset text-xxs"
              :class="navPosition && `header-nav-${navPosition}`"
            >
              <li>
                <router-link to="/about/"> about  </router-link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import CLogo from "@/layouts/partials/Logo.vue";
import CLogoHeader from "@/layouts/headers/LogoHeader.vue";
import CSaleBanner from "@/layouts/partials/SaleBanner.vue";

export default {
  name: "CHeader",
  components: {
    CLogo,
    CLogoHeader,
    CSaleBanner
  },
  props: {
    active: Boolean,
    navPosition: {
      type: String,
      default: ""
    },
    hideNav: {
      type: Boolean,
      default: false
    },
    hideSignin: {
      type: Boolean,
      default: false
    },
    bottomOuterDivider: {
      type: Boolean,
      default: false
    },
    bottomDivider: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isActive: this.active || false
    };
  },
  watch: {
    active(value) {
      this.isActive = value;
    }
  },

  methods: {
    openMenu() {
      document.body.classList.add("off-nav-is-active");
      if (this.$refs.nav)
        this.$refs.nav.style.maxHeight = this.$refs.nav.scrollHeight + "px";
      this.$emit("update:active", true);
      this.isActive = true;
    },
    closeMenu() {
      document.body.classList.remove("off-nav-is-active");
      if (this.$refs.nav) this.$refs.nav.style.maxHeight = null;
      this.$emit("close");
      this.$emit("update:active", false);
      this.isActive = false;
    },
    keyPress() {
      this.isActive && event.keyCode === 27 && this.closeMenu();
    },
    clickOutside(e) {
      if (!this.$refs.nav) return;
      if (
        !this.isActive ||
        this.$refs.nav.contains(e.target) ||
        e.target === this.$refs.hamburger
      )
        return;
      this.closeMenu();
    },
    checkIrish() {
      if(localStorage.getItem('country') == 'IE') {
        return true;
      }
      return false;
    }
  },
  mounted() {
    this.active && this.openMenu();
    document.addEventListener("keydown", this.keyPress);
    document.addEventListener("click", this.clickOutside);
  },
  beforeDestroy() {
    document.addEventListener("keydown", this.keyPress);
    document.removeEventListener("click", this.clickOutside);
    this.closeMenu();
  }
};
</script>
<style media="screen">

.header-logo img {
  margin: 0px auto !important;
  width: 10vw;
  max-height: 60px;
}

.info-box {
  background-color: rgb(231.548582996, 140.5570850202, 46.751417004);
  line-height: 26px;
  font-size: 0.6rem;
  color: white;
  text-align: center;
  left: 0;
  top: 0;
  width: 100%;
}

</style>

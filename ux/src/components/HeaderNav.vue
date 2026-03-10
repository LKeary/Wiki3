<template lang="pug">
q-header.bg-header.text-white.site-header(
  height-hint='64'
  )
  .row.no-wrap.items-center
    q-toolbar.site-header-toolbar(
      style='height: 64px; min-height: 64px;'
      dark
      )
      q-btn.q-mr-xs.lt-sm(
        v-if='siteStore.theme.sidebarPosition !== `off`'
        dense
        flat
        round
        icon='las la-bars'
        :aria-label='t(`common.actions.menu`, `Menu`)'
        @click='siteStore.toggleMobileSidebar()'
        )
        q-tooltip {{ t('common.actions.menu', 'Menu') }}
      q-btn(
        dense
        flat
        to='/'
        )
        q-avatar(
          v-if='siteStore.logoText'
          size='34px'
          square
          )
          img(:src='`/_site/logo`')
        img(
          v-else
          :src='`/_site/logo`'
          style='height: 34px'
          )
      q-toolbar-title.text-h6.text-no-wrap.ellipsis(v-if='siteStore.logoText') {{ siteStore.title }}
    header-search.header-search
    q-toolbar.site-header-toolbar.header-actions(
      style='height: 64px; min-height: 64px;'
      dark
      )
      q-space
      transition(name='syncing')
        q-spinner-tail(
          v-show='commonStore.routerLoading'
          color='accent'
          size='24px'
        )
      q-btn.q-ml-sm(
        v-if='userStore.can(`write:pages`)'
        flat
        round
        dense
        icon='las la-plus-circle'
        color='blue-4'
        aria-label='Create New Page'
        )
        q-tooltip Create New Page
        new-menu
      q-btn.q-ml-sm(
        v-if='userStore.can(`browse:fileman`)'
        flat
        round
        dense
        icon='las la-folder-open'
        color='positive'
        aria-label='File Manager'
        @click='openFileManager'
        )
        q-tooltip File Manager
      q-btn.q-ml-sm(
        v-if='userStore.can(`access:admin`)'
        flat
        round
        dense
        icon='las la-tools'
        color='pink'
        to='/_admin'
        :aria-label='t(`common.header.admin`)'
        )
        q-tooltip {{ t('common.header.admin') }}

      //- USER BUTTON / DROPDOWN
      account-menu(v-if='userStore.authenticated')
      q-btn.q-ml-sm(
        v-else
        flat
        rounded
        icon='las la-sign-in-alt'
        color='white'
        :label='$t(`common.actions.login`)'
        :aria-label='$t(`common.actions.login`)'
        to='/login'
        padding='sm'
        no-caps
        class='gt-xs'
      )
      q-btn.q-ml-sm(
        v-else
        flat
        round
        dense
        icon='las la-sign-in-alt'
        color='white'
        :aria-label='$t(`common.actions.login`)'
        to='/login'
        class='lt-sm'
      )
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useCommonStore } from '@/stores/common'
import { useSiteStore } from '@/stores/site'
import { useUserStore } from '@/stores/user'

import AccountMenu from '@/components/AccountMenu.vue'
import NewMenu from '@/components/PageNewMenu.vue'
import HeaderSearch from '@/components/HeaderSearch.vue'

// QUASAR

const $q = useQuasar()

// STORES

const commonStore = useCommonStore()
const siteStore = useSiteStore()
const userStore = useUserStore()

// ROUTER

const router = useRouter()
const route = useRoute()

// I18N

const { t } = useI18n()

// METHODS

function openFileManager () {
  siteStore.openFileManager()
}
</script>

<style lang="scss" scoped>
.site-header {
  .row {
    min-width: 0;
  }
  .site-header-toolbar {
    min-width: 0;
    flex: 0 1 auto;
  }
  .header-search {
    flex: 1 1  auto;
    min-width: 0;
    max-width: 280px;
    @media (min-width: 600px) {
      max-width: 360px;
    }
  }
  .header-actions {
    flex: 0 0 auto;
    min-width: 0;
  }
}
</style>

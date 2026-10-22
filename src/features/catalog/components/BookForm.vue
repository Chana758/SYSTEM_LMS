<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2">
        <label :for="id('title')" :class="labelCls">{{ t('catalog.form.bookTitle') }}</label>
        <input :id="id('title')" v-model="form.title" type="text" :class="inp(errors.title)" />
        <p v-if="errors.title" :class="errCls">{{ errors.title }}</p>
      </div>

      <div>
        <label :for="id('isbn')" :class="labelCls">{{ t('catalog.form.isbn') }}</label>
        <input
          :id="id('isbn')"
          v-model="form.isbn"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="978-..."
          class="font-mono"
          :class="inp(errors.isbn || isbnError)"
          @input="isbnError = ''"
        />
        <p v-if="isbnError" :class="errCls">{{ isbnError }}</p>
        <p v-else-if="errors.isbn" :class="errCls">{{ errors.isbn }}</p>
        <p v-else class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ t('catalog.form.isbnHint') }}</p>
      </div>

      <div>
        <label :for="id('author')" :class="labelCls">{{ t('catalog.form.author') }}</label>
        <input :id="id('author')" v-model="form.author" type="text" :class="inp(errors.author)" />
        <p v-if="errors.author" :class="errCls">{{ errors.author }}</p>
      </div>

      <div>
        <label :for="id('category')" :class="labelCls">{{ t('catalog.form.category') }}</label>
        <select :id="id('category')" v-model="form.category_id" :class="[inp(errors.category_id), 'dark:[color-scheme:dark]']">
          <option value="">{{ t('catalog.form.selectCategory') }}</option>
          <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="errors.category_id" :class="errCls">{{ errors.category_id }}</p>
      </div>

      <div>
        <label :for="id('qty')" :class="labelCls">{{ t('catalog.form.totalCopies') }}</label>
        <input
          :id="id('qty')"
          v-model.number="form.total_qty"
          type="number" inputmode="numeric" min="1"
          :disabled="isEdit"
          class="disabled:bg-gray-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          :class="inp(errors.total_qty)"
        />
        <p v-if="isEdit" class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ t('catalog.form.useAddCopiesHint') }}</p>
        <p v-if="errors.total_qty" :class="errCls">{{ errors.total_qty }}</p>
      </div>

      <div>
        <label :for="id('publisher')" :class="labelCls">{{ t('catalog.form.publisher') }}</label>
        <input :id="id('publisher')" v-model="form.publisher" type="text" :class="inp()" />
      </div>

      <div>
        <label :for="id('year')" :class="labelCls">{{ t('catalog.form.publishYear') }}</label>
        <input :id="id('year')" v-model.number="form.publish_year" type="number" inputmode="numeric" :class="inp()" />
      </div>

      <div>
        <label :for="id('language')" :class="labelCls">{{ t('catalog.form.language') }}</label>
        <input :id="id('language')" v-model="form.language" type="text" :placeholder="t('catalog.form.languagePlaceholder')" :class="inp()" />
      </div>

      <div>
        <label :for="id('shelf')" :class="labelCls">{{ t('catalog.form.shelfLocation') }}</label>
        <input :id="id('shelf')" v-model="form.shelf_location" type="text" :class="inp()" />
      </div>

      <div class="sm:col-span-2">
        <label :for="id('description')" :class="labelCls">{{ t('catalog.form.description') }}</label>
        <textarea :id="id('description')" v-model="form.description" rows="3" :class="inp()"></textarea>
      </div>

      <div class="sm:col-span-2">
        <label :for="id('cover')" :class="labelCls">{{ t('catalog.form.coverImage') }}</label>
        <input
          :id="id('cover')"
          type="file" accept="image/*" @change="handleFileChange"
          class="file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-emerald-700 dark:file:bg-emerald-500/15 dark:file:text-emerald-300"
          :class="inp()"
        />
        <img v-if="coverPreviewUrl" :src="coverPreviewUrl" class="mt-2 h-24 rounded-lg object-cover" />
      </div>
    </div>

    <p v-if="errors.general" :class="errCls">{{ errors.general }}</p>

    <!-- Buttons: stacked + full width on phones, inline on sm+ -->
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-white/15 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
        {{ t('catalog.common.cancel') }}
      </button>
      <button type="submit" :disabled="loading" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-sm disabled:opacity-50 cursor-pointer">
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCatalogStore } from '../store/catalogStore'

const { t } = useI18n()

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit', 'cancel'])

const store = useCatalogStore()
const coverPreviewUrl = ref(null)
const isbnError = ref('')

// Unique prefix so label[for] <-> input[id] work even if two forms exist on one page.
const uid = 'bf-' + Math.random().toString(36).slice(2, 8)
const id = (name) => `${uid}-${name}`

// ---- shared light/dark classes ----
// Phones: text-base (16px) so iOS Safari does not zoom on focus, taller fields for thumbs.
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'
const errCls = 'text-red-500 dark:text-rose-400 text-sm mt-1'
const inp = (hasError) => [
  'w-full border rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm bg-white text-slate-900 placeholder:text-slate-400',
  'dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500',
  hasError ? 'border-red-500 dark:border-rose-400' : 'border-gray-300 dark:border-white/15',
]

const form = reactive({
  title: '', isbn: '', author: '', publisher: '', category_id: '',
  language: 'en', publish_year: null, edition: '', pages: null,
  description: '', total_qty: 1, shelf_location: '', price: null,
})

const submitLabel = computed(() => {
  if (props.loading) {
    return props.isEdit ? t('catalog.common.saving') : t('catalog.form.creating')
  }
  return props.isEdit ? t('catalog.common.saveChanges') : t('catalog.form.createBook')
})

// ISBN is typed or scanned from the real book - never generated.
const cleanIsbn = (raw) => String(raw || '').replace(/[\s-]/g, '').toUpperCase()

function isValidIsbn(raw) {
  const s = cleanIsbn(raw)
  if (s.length === 10) {
    if (!/^\d{9}[\dX]$/.test(s)) return false
    let sum = 0
    for (let i = 0; i < 10; i++) sum += (s[i] === 'X' ? 10 : Number(s[i])) * (10 - i)
    return sum % 11 === 0
  }
  if (s.length === 13) {
    if (!/^\d{13}$/.test(s)) return false
    let sum = 0
    for (let i = 0; i < 12; i++) sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3)
    return (10 - (sum % 10)) % 10 === Number(s[12])
  }
  return false
}

let coverFile = null
function handleFileChange(e) {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  coverFile = e.target.files[0] || null
  coverPreviewUrl.value = coverFile ? URL.createObjectURL(coverFile) : null
}

watch(() => props.initialData, (data) => {
  if (data && Object.keys(data).length) {
    Object.assign(form, {
      title: data.title || '', isbn: data.isbn || '', author: data.author || '',
      publisher: data.publisher || '', category_id: data.category_id || '',
      language: data.language || 'en', publish_year: data.publish_year || null,
      edition: data.edition || '', pages: data.pages || null,
      description: data.description || '', total_qty: data.total_qty || 1,
      shelf_location: data.shelf_location || '', price: data.price || null,
    })
  }
}, { immediate: true })

function handleSubmit() {
  // ISBN is optional (old / local books may have none), but if typed it must be valid.
  if (form.isbn && !isValidIsbn(form.isbn)) {
    isbnError.value = t('catalog.form.isbnInvalid')
    return
  }

  const fd = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (value === null || value === '') return
    if (props.isEdit && key === 'total_qty') return
    fd.append(key, key === 'isbn' ? cleanIsbn(value) : value)
  })
  if (coverFile) fd.append('cover_image', coverFile)
  emit('submit', fd)
}

onMounted(() => {
  if (!store.categories.length) store.fetchCategories()
})

onBeforeUnmount(() => {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
})
</script>
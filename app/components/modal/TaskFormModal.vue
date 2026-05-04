<template>
    <div class="task-form">
        <h2 class="task-form__title">{{ isEdit ? 'Edit Task' : 'Add New Task' }}</h2>

        <!-- Title -->
        <BaseInput v-model="formTitle" label="Title" placeholder="e.g. Take coffee break" :error="titleError" />

        <!-- Description -->
        <BaseTextarea v-model="formDescription" label="Description" placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little." />

        <!-- Subtasks -->
        <div class="task-form__field-group">
            <span class="task-form__field-label">Subtasks</span>
            <ul class="task-form__list">
                <li v-for="(subtask, i) in subtaskInputs" :key="i" class="task-form__list-item">
                    <input v-model="subtask.value" type="text" class="task-form__input" :class="{ 'task-form__input--error': subtask.error }" placeholder="e.g. Make coffee" />
                    <button type="button" class="task-form__remove-btn" aria-label="Remove subtask" @click="removeSubtask(i)">
                        <img :src="crossIcon" alt="" aria-hidden="true" width="15" height="15" />
                    </button>
                </li>
            </ul>
            <BaseButton variant="secondary" full @click="addSubtask">+ Add New Subtask</BaseButton>
        </div>

        <!-- Status -->
        <BaseDropdown v-model="formStatus" :options="columnNames" label="Status" />

        <!-- Priority -->
        <BaseDropdown v-model="formPriority" :options="priorityOptions" label="Priority" />

        <!-- Due Date -->
        <div class="task-form__field-group">
            <span class="task-form__field-label">Due Date <span class="task-form__optional">(optional)</span></span>
            <input v-model="formDueDate" type="date" class="task-form__input task-form__input--date" />
        </div>

        <!-- Submit -->
        <BaseButton variant="primary-l" full @click="onSubmit">
            {{ isEdit ? 'Save Changes' : 'Create Task' }}
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'
import type { Task, Priority } from '~/types'
import crossIcon from '~/assets/icons/icon-cross.svg'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const isEdit = computed(() => uiStore.activeModal?.type === 'editTask')
const payload = computed(() => uiStore.activeModal?.payload as { task: Task; columnName: string } | undefined)

// Column names for the status dropdown
const columnNames = computed(() => boardStore.activeBoard?.columns.map(c => c.name) ?? [])

const priorityOptions: Priority[] = ['low', 'medium', 'high', 'urgent']

// Form state - pre-populate in edit mode
const formTitle = ref(isEdit.value && payload.value ? payload.value.task.title : '')
const formDescription = ref(isEdit.value && payload.value ? payload.value.task.description : '')
const formStatus = ref(
    isEdit.value && payload.value
        ? payload.value.task.status
        : (columnNames.value[0] ?? ''),
)
const formPriority = ref<Priority>(
    isEdit.value && payload.value?.task.priority
        ? payload.value.task.priority
        : 'medium',
)
const formDueDate = ref(
    isEdit.value && payload.value?.task.dueDate ? payload.value.task.dueDate : '',
)
const subtaskInputs = ref<{ value: string; error: boolean }[]>(
    isEdit.value && payload.value
        ? payload.value.task.subtasks.map(s => ({ value: s.title, error: false }))
        : [],
)

// Capture originals for edit mode
const originalTitle = payload.value?.task.title ?? ''
const originalStatus = payload.value?.columnName ?? ''

// Validation
const titleError = ref('')

function addSubtask() {
    subtaskInputs.value.push({ value: '', error: false })
}

function removeSubtask(i: number) {
    subtaskInputs.value.splice(i, 1)
}

function onSubmit() {
    // Validate
    titleError.value = formTitle.value.trim() ? '' : "Can't be empty"
    subtaskInputs.value.forEach(s => {
        s.error = !s.value.trim()
    })

    if (titleError.value || subtaskInputs.value.some(s => s.error)) return

    const task: Task = {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        status: formStatus.value,
        priority: formPriority.value,
        dueDate: formDueDate.value || undefined,
        subtasks: subtaskInputs.value
            .filter(s => s.value.trim())
            .map(s => ({ title: s.value.trim(), isCompleted: false })),
    }

    if (isEdit.value) {
        // Preserve subtask completion state from original
        const original = payload.value!.task
        task.subtasks = subtaskInputs.value
            .filter(s => s.value.trim())
            .map(s => {
                const existing = original.subtasks.find(o => o.title === s.value.trim())
                return { title: s.value.trim(), isCompleted: existing?.isCompleted ?? false }
            })
        boardStore.updateTask(originalTitle, originalStatus, task)
    } else {
        boardStore.addTask(task)
    }

    uiStore.closeModal()
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.task-form {
    display: flex;
    flex-direction: column;
    gap: 24px;

    &__title {
        @include type('heading-l');
        color: var(--color-text-primary);
    }

    &__field-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__field-label {
        @include type('body-m');
        color: var(--color-text-secondary);
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__list-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__input {
        @include type('body-l');
        flex: 1;
        padding: 8px 16px;
        background-color: var(--color-surface);
        border: 1px solid var(--color-input-border-idle);
        border-radius: var(--radius-input);
        color: var(--color-text-primary);
        outline: none;
        transition: border-color 0.15s ease;

        &::placeholder {
            color: var(--color-text-placeholder);
        }

        &:focus {
            border-color: var(--color-primary);
        }

        &--error {
            border-color: var(--color-danger);


            &--date {
                width: 100%;
                color-scheme: light dark;
            }
        }

        &__optional {
            @include type('body-m');
            color: var(--color-text-secondary);
            font-weight: 400;
        }

        &__remove-btn {
            @include focus-ring;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.15s ease;

            &:hover {
                opacity: 1;
            }
        }
    }
}
</style>

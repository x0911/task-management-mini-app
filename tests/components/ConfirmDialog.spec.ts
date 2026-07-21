import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import BaseModal from '../../components/BaseModal.vue'

function mountDialog(props: Record<string, any> = {}) {
  return mount(ConfirmDialog, {
    attachTo: document.body,
    props: {
      modelValue: true,
      title: 'Delete task',
      message: 'Are you sure?',
      ...props
    },
    global: { components: { BaseModal } }
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ConfirmDialog', () => {
  it('renders the title and message when open', () => {
    mountDialog()
    expect(document.body.textContent).toContain('Delete task')
    expect(document.body.textContent).toContain('Are you sure?')
  })

  it('does not render content when closed', () => {
    mountDialog({ modelValue: false })
    expect(document.body.textContent).not.toContain('Are you sure?')
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mountDialog()
    const confirmButton = document.body.querySelector<HTMLButtonElement>(
      '[data-testid="confirm-dialog-confirm"]'
    )
    confirmButton!.dispatchEvent(new Event('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits update:modelValue false when cancel is clicked', async () => {
    const wrapper = mountDialog()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const cancelButton = buttons.find((b) => b.textContent?.trim() === 'Cancel')
    cancelButton!.dispatchEvent(new Event('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('disables both action buttons while busy', () => {
    mountDialog({ busy: true })
    const cancel = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Cancel'
    )
    const confirm = document.body.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(cancel?.hasAttribute('disabled')).toBe(true)
    expect(confirm?.hasAttribute('disabled')).toBe(true)
  })

  it('uses the danger styling when the danger prop is set', () => {
    mountDialog({ danger: true })
    const confirmButton = document.body.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmButton?.className).toContain('btn-danger')
  })
})

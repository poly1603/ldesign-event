<script setup lang="ts">
import { ref } from 'vue'
import { useEventBus } from '@ldesign/event-vue'

type Events = {
  'message:send': { text: string; time: string }
  'counter:increment': number
}

const { on, emit } = useEventBus<Events>()

const messages = ref<Array<{ text: string; time: string }>>([])
const counter = ref(0)
const input = ref('')

on('message:send', (data) => {
  messages.value.push(data)
})

on('counter:increment', (val) => {
  counter.value += val
})

function sendMessage() {
  if (!input.value.trim()) return
  emit('message:send', { text: input.value, time: new Date().toLocaleTimeString() })
  input.value = ''
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/event Playground</h1>

    <section style="margin-bottom: 24px;">
      <h2>消息事件</h2>
      <div style="display:flex;gap:8px;">
        <input v-model="input" @keyup.enter="sendMessage" placeholder="输入消息..." style="flex:1;padding:8px;" />
        <button @click="sendMessage" style="padding:8px 16px;">发送</button>
      </div>
      <ul style="margin-top:12px;">
        <li v-for="(msg, i) in messages" :key="i">[{{ msg.time }}] {{ msg.text }}</li>
      </ul>
    </section>

    <section>
      <h2>计数器事件</h2>
      <p>当前值: <strong>{{ counter }}</strong></p>
      <button @click="emit('counter:increment', 1)" style="padding:8px 16px;margin-right:8px;">+1</button>
      <button @click="emit('counter:increment', 5)" style="padding:8px 16px;margin-right:8px;">+5</button>
      <button @click="emit('counter:increment', -1)" style="padding:8px 16px;">-1</button>
    </section>
  </div>
</template>

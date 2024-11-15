<template>
    <div class="h-screen pt-[100px] space-y-12">
        <div class="max-w-xl mx-auto space-y-6">

            <!-- Header -->
            <div class="space-y-0.5">
                <div class="text-2xl font-medium">Good morning,</div>
                <div class="text-xl text-muted-foreground">Today is Thursday, November 14, 2024</div>
            </div>

            <!-- Open Url Form Dialog -->
            <Button variant="outline" class="w-full border-dashed" @click="openUrlForm()">
                Add Url
            </Button>

            <!-- Url Form Dailog -->
            <Dialog v-model:open="showUrlForm">
                <DialogContent class="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Url</DialogTitle>
                        <DialogDescription>Enter a url in order to create a new bookmark.</DialogDescription>
                    </DialogHeader>
                    <div class="flex items-center space-x-2">
                        <div class="grid flex-1 gap-2">
                            <Label for="link" class="sr-only">Url</Label>
                            <Input v-model="urlModel" placeholder="Enter url" @keyup.enter="insertUrl()" />
                        </div>
                        <Button type="submit" size="sm" class="px-3" @click="insertUrl()">
                            <span class="sr-only">Save</span>
                            <Check class="w-4 h-4" />
                        </Button>
                    </div>
                    <DialogFooter class="sm:justify-start">
                        <DialogClose as-child>
                            <Button type="button" variant="secondary">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>

        <!-- Urls Grid -->
        <div class="max-w-4xl mx-auto grid grid-cols-8 gap-4">
            <ContextMenu v-for="(url, index) in urlsList" :key="index">
                <ContextMenuTrigger as-child>
                    <div class="bg-slate-100 flex items-center justify-center overflow-hidden rounded-md h-16" @click.left="openUrl(url.url)">
                        <img :src="url.faviconUrl" alt="">
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem @click="removeUrl(url.url)">Delete</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import type { Link } from './types/link'
    import { fetchLinkMetadata } from './helpers/linkMetadata'

    import { Label } from '@/components/ui/label'
    import { Input } from '@/components/ui/input'
    import { Button } from '@/components/ui/button'
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
    import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
    import { Check } from 'lucide-vue-next'

    const showUrlForm = ref<boolean>(false)
    const urlModel = ref<string>('')
    const urlsList = ref<Link[]>([])

    onMounted(() => {
        loadUrls()
    });

    const openUrlForm = () => {
        if (!showUrlForm.value) {
            showUrlForm.value = true
        }
    }

    const openUrl = (url: string) => {
        window.open(url, '_blank')
    }

    const insertUrl = async () => {
        if (urlModel.value) {
            const metadata = await fetchLinkMetadata(urlModel.value)
            urlsList.value.push({ url: urlModel.value, title: metadata.title, faviconUrl: metadata.faviconUrl })
            saveUrl()
            urlModel.value = ''
            showUrlForm.value = false
        }
    }

    const saveUrl = () => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ urls: urlsList.value })
        }
        else {
            console.warn("Chrome storage API is not available in this environment.")
        }
    }

    const removeUrl = (url: string) => {
        urlsList.value = urlsList.value.filter(item => item !== url);
        saveUrl()
    }

    const loadUrls = () => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get('urls', (data) => {
                urlsList.value = data.urls || [];
            });
        }
        else {
            console.warn("Chrome storage API is not available in this environment.")
        }
    };
</script>

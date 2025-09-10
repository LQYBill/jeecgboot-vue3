<template>
  <div v-if="!isEmployee" :class="[`${prefixCls}`]">
    <h2>Preferences</h2>
    <div class="flex items-center gap-2">
      <label>
        <span>Receive Invoice Emails: </span>
      </label>
      <a-switch
        :checked="invoiceEmailPreference"
        @change="handleInvoiceEmailChange"
        :loading="invoiceEmailLoading"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useDesign} from "@/hooks/web/useDesign";
import {onMounted, ref} from "vue";
import {getUserPreferences, setUserPreferences} from "@/views/system/usersetting/UserSetting.api";
import {useUserStore} from "@/store/modules/user";
import {UserPreferences} from "@/views/business/dto/userPreferences.dto";

const { prefixCls } = useDesign('j-user-account-setting-container');
const invoiceEmailPreference = ref(false);
const invoiceEmailLoading = ref(true);

const isEmployee = ref(true);
const userPreferences = ref<UserPreferences>()
const userStore = useUserStore();

onMounted(async () => {
  isEmployee.value = userStore.getIsEmployee;
  if(!isEmployee.value)
    await fetchUserPreferences();
})
async function fetchUserPreferences() {
  if(isEmployee.value) {
    invoiceEmailLoading.value = false;
    return;
  }
  await getUserPreferences()
    .then((res: UserPreferences) => {
      userPreferences.value = res;
      invoiceEmailPreference.value = res.invoiceMail || false;
    })
    .catch((error) => {
      console.error('Error fetching user preferences:', error);
    })
    .finally(() => {
      invoiceEmailLoading.value = false;
    });
}
async function handleInvoiceEmailChange(checked: boolean) {
  invoiceEmailPreference.value = checked;
  invoiceEmailLoading.value = true;
  await setUserPreferences({invoiceMail: checked})
    .catch((error) => {
      console.error('Error updating user preferences:', error);
    })
    .finally(async () => {
      await getUserPreferences();
      invoiceEmailLoading.value = false;
    });
}
</script>

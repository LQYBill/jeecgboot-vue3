<template>
  <PageWrapper title="Orders Management Page">
    <Card v-if="internalUse">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row>
          <a-col>
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-bind="validateInfos.name"
              name="customer"
            >
              <template #label>
                <span title="Customer">{{ t('data.invoice.customer') }}</span>
              </template>
              <JSearchSelect
                :placeholder="t('component.searchForm.clientInputSearch')"
                :dictOptions="customerSelectList"
                @change="handleClientChange"
                v-model:value="formState.customer"
                allowClear
                :disabled="customerListDisabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </Card>
    <Card v-if="client !== null">
      <BasicForm @register="register" @submit="handleSubmit">
        <template #add="{field}">
          <Button v-if="field > 0" @click="del(field)" type="error">-</Button>
        </template>
        <template #formFooter>
          <footer class="flex w-full justify-between">
            <a-tooltip placement="bottom">
              <template #title>
                <span>Add row</span>
              </template>
              <Button @click="add" type="success">+</Button>
            </a-tooltip>
            <div>
              <APopconfirm title="Confirm actions ?" @confirm="handleSubmit" class="mr-2">
                <Button type="primary">Submit</Button>
              </APopconfirm>
              <Button @click="handleReset" type="default" preIcon="ic:baseline-restart-alt">{{ t('common.operation.reset') }}</Button>
            </div>
          </footer>
        </template>
      </BasicForm>
    </Card>
  </PageWrapper>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import {Card, Form} from 'ant-design-vue';
import BasicForm from "@/components/Form/src/BasicForm.vue";
import {Button} from "@/components/Button";

import {FormSchema, useForm} from "@/components/Form";
import {h, onMounted, reactive, ref} from 'vue';
import {useI18n} from "@/hooks/web/useI18n";

import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/orders/OrdersManagement.api";
import {
  OrderActionParam, OrderActionResponse,
  PlatformOrderOption,
  PlatformOrderOptionsMap
} from "@/views/business/client/orders/Interfaces";
import {useMessage} from "@/hooks/web/useMessage";

const { t } = useI18n();
const { createMessage } = useMessage();
// Form config
const uf = Form.useForm;
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 2 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 12 } });
const validatorRules = ref({
  customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
});
const formState = reactive<Record<string, any>>({
  customer: '',
});
const { validateInfos } = uf(formState, validatorRules, { immediate: false });

const internalUse = ref<boolean>(false);
const customerList = ref<any[]>([]);
const customerSelectList = ref<any[]>([]);
const customerListDisabled = ref<boolean>(false);

const client = ref<any>(null);
const shopList = ref<any[]>([]);
const shopDisabled = ref<boolean>(true);
const selectedShopList = ref<{[key:string]: string}>({}); // {0: 'shopId1', 1: 'shopId2', ...}
const orderListByShop = ref<PlatformOrderOptionsMap>({}); // {shopId1: [{label: ..., value: ..., erpStatus: ..., disabled: ...}, {label: ..., value: ..., erpStatus: ..., disabled: ...}, ...], shopId2: [..], ...}
const selectableOrderList = ref<PlatformOrderOptionsMap>({}); // {shopId1: [{label: ..., value: ..., erpStatus: ..., disabled: ...}, {label: ..., value: ..., erpStatus: ..., disabled: ...}, ...], shopId2: [..], ...} , update everytime an order is selected or when we change shop (re-add the orders removed from list)
const selectedOrderList = ref<{[key:string]: string[]}>({0:[],}); // {0: ['1234','56789',], 1: [...], ...}

const n = ref(1);
const formSchema: FormSchema[] = [
  {
    field: 'shop0',
    component: 'JSearchSelect',
    label: t('data.invoice.shop'),
    colProps: {
      span: 6,
    },
    itemProps: {
      labelAlign: 'left',
      labelCol: reactive({
        xs: { span: 4 },
        lg: { span: 4 },
        xl: { span: 4 },
      }),
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 20 },
        xl: { span: 20 },
      }),
    },
    componentProps: {
      dictOptions: shopList,
      disabled: shopDisabled,
      placeholder: t('data.invoice.shop'),
      onChange: (e: any) => {
        handleShopChange(e, '0');
      },
    },
    rules: [
        {
          required: true,
          message: t('component.searchForm.shopInputSearch')
        },
    ],
  },
  {
    field: 'orderNum0',
    component: 'JSelectMultiple',
    label: t('data.order.Num'),
    colProps: {
      span: 8,
    },
    itemProps: {
      labelCol: reactive({
        xs: { span: 4 },
        lg: { span: 6 },
        xl: { span: 8 },
        xxl: { span: 6 },
      }),
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 18 },
        xl: { span: 16 },
        xxl: { span: 18 },
      }),
    },
    componentProps: {
      placeholder: t('data.order.Num'),
      options: [],
      onChange: (e: any) => {
        handleOrdersChange(e, '0');
      },
    },
    labelWidth: 100,
    dynamicDisabled: true,
    rules: [
      {
        required: true,
        message: t('component.searchForm.ordersSelectSearch')
      },
    ],
  },
  {
    field: 'operation0',
    component: 'Select',
    label: t('common.operation.action'),
    colProps: {
      span: 8,
    },
    componentProps: {
      placeholder: t("common.operation.action"),
      options: [
        {label: t('common.operation.cancel'), value: 'Cancel'},
        {label: 'Suspend', value: 'Suspend'},
      ]
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.actionInput')
      },
    ],
  },
  {
    field: '0',
    component: 'Input',
    label: '',
    colProps: {
      span: 1,
    },
    slot: 'add',
  },
  {
    field: 'reason0',
    component: 'InputTextArea',
    label: t('data.order.reason'),
    colProps: {
      span: 24,
    },
    itemProps: {
      labelAlign: 'left',
      labelCol: reactive({
        xs: { span: 2 },
        lg: { span: 2 },
        xl: { span: 2 },
      }),
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 20 },
        xl: { span: 20 },
      }),
    },
    componentProps: {
      placeholder: t('data.order.reason'),
      rows: 2,
      itemProps: {
        labelCol: reactive({
          xs: { span: 0 },
        }),
        wrapperCol: reactive({
          xs: { span: 24 },
        }),
      },
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.reasonInputText'),
        type: 'string',
      },
    ],
  },
];
const [register, { appendSchemaByField, removeSchemaByFiled, validate, resetFields, resetSchema, updateSchema }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
});

onMounted(() => {
  checkUser();
});
async function checkUser() {
  defHttp.get({url: Api.getClient})
    .then(res => {
      if(res.internal) {
        customerList.value = res.internal;
        customerSelectList.value = res.internal.map(
          client => ({
            text: `${client.firstName} ${client.surname} (${client.internalCode})`,
            value: client.id,
          })
        );
        internalUse.value = true;
      }
      else {
        loadClient(res.client);
      }
    })
    .catch(e => {
      console.error(e);
    })
}
function loadClient(clientParam: any) {
  client.value = clientParam;
  loadShops();
}
function loadShops() {
  defHttp.get({url: Api.getShops, params: {clientID: client.value.id}})
    .then(res => {
      shopList.value = res.map(
        shop => ({
          text: shop.name,
          value: shop.id,
        })
      );
      shopDisabled.value = false;
    })
    .catch(e => {
      console.error(e);
    })
}
function handleClientChange(id: string) {
  if(client.value !== null) {
    client.value = null;
    resetFields();
    resetSchema(formSchema);
  }
  if(id) {
    let index = customerList.value.map(i => i.id).indexOf(id);
    loadClient(customerList.value[index]);
  }
}
function handleShopChange(newShop: string, field: string) {
  let shop = selectedShopList.value[field];
  if(typeof newShop !== 'undefined') {
    // re-add previously selected orders to selectable list if shop changed
    if(typeof selectedShopList.value[field] !== 'undefined' && !!selectedOrderList.value[field]){
      addOrdersToSelectableList(shop, field);
    }
    // remove field/order mapping
    delete selectedOrderList.value[field];
    selectedShopList.value[field] = newShop;
    loadOrders(newShop, field);
  }
  else {
    // re-add selected orders to selectable list
    addOrdersToSelectableList(shop, field);
    // remove field/order mapping and field/shop mapping
    delete selectedOrderList.value[field];
    delete selectedShopList.value[field];
    updateSchema(
      {
        field: `orderNum${field}`,
        dynamicDisabled: true,
      }
    )
  }
}
function loadOrders(shopId:string, field: string) {
  if(!orderListByShop.value.hasOwnProperty(shopId)) {
    defHttp.get({url: Api.getOrders, params: {shopID: shopId}})
      .then(res => {
        orderListByShop.value[shopId] = res;
        selectableOrderList.value[shopId] = res;
        updateSchema(
          {
            field: `orderNum${field}`,
            componentProps: {
              options: selectableOrderList.value[shopId],
            },
            dynamicDisabled: false,
          }
        ).then(() => {
        })
        .catch(e => {
          console.error('Error while updating schema : ' + e);
        });
      })
      .catch(e => {
        console.error(e);
      });
  } else {
    // ... load orders as options from shop
    updateSchema(
      {
        field: `orderNum${field}`,
        componentProps: {
          options: selectableOrderList.value[shopId],
        },
        dynamicDisabled: false,
      }
    ).then(() => {
    })
    .catch(e => {
      console.error('Error while updating schema : ' + e);
    });
  }
}
function handleOrdersChange(orderList: string, field: string) {
  let shop = selectedShopList.value[field];
  if(!!orderList) {
    let orderIds = orderList.split(',');
    selectedOrderList.value[field] = orderIds;
    selectableOrderList.value[shop] = selectableOrderList.value[shop].filter(
      orderOption => !orderIds.includes(orderOption.value)
    );
  }
  else {
    addOrdersToSelectableList(shop, field);
  }
  updateSameShopOrderField(shop, field);
}
function addOrdersToSelectableList(shopId: string, field: string) {
  let updatedSelectableOrders: PlatformOrderOption[]= [];
  if(typeof selectedOrderList.value[field] === 'undefined') return;
  for (let order of selectedOrderList.value[field]) {
    let orderOption = orderListByShop.value[shopId].find(
      option => option.value === order
    );
    if(orderOption)
      updatedSelectableOrders.push(orderOption);
    else {
      createMessage.error(`Order ${order} not found in shop ${shopId}`);
      console.error(`Order ${order} not found in shop ${shopId}`);
    }
  }
  selectableOrderList.value[shopId] = updatedSelectableOrders.concat(selectableOrderList.value[shopId]);
}
function updateSameShopOrderField(shop: string, field: string) {
  for(let fieldNum in selectedShopList.value) {
    if(selectedShopList.value[fieldNum] === shop && fieldNum !== field) {
      let selectedOrders = selectedOrderList.value[fieldNum];
      if(typeof selectedOrders === 'undefined') continue;
      let updatedSelectableOrders = orderListByShop.value[shop].filter(
        option => selectedOrders.includes(option.value)
      );
      updatedSelectableOrders = updatedSelectableOrders.concat(selectableOrderList.value[shop]);
      updateSchema(
        {
          field: `orderNum${fieldNum}`,
          componentProps: {
            options: updatedSelectableOrders,
          },
        }
      ).then(() => {
      }).catch(e => {
        console.error('Error while updating schema : ' + e);
      });
    }
  }
}
async function handleSubmit() {
  try {
    const data = await validate();
    let params:OrderActionParam[] = [];
    for(let i = 0; i < n.value; i++) {
      if(!data.hasOwnProperty(i)) {
        continue;
      }
      let shop:string = data[`shop${i}`];
      let orders:string = data[`orderNum${i}`];
      let operation:string = data[`operation${i}`];
      let reason:string = data[`reason${i}`];
      if(shop && orders && operation && reason) {
        params.push({
          shopId: shop,
          orderIds: orders,
          action: operation,
          reason: reason,
        });
      }
    }
    defHttp.post({url: Api.postOrders, params: params})
      .then(res => {
        const cancelResult: OrderActionResponse = res.cancelResult;
        const suspendResult: OrderActionResponse = res.suspendResult;
        createMessage.info(h('span', {'innerHTML': `${cancelResult.successes.length}/${cancelResult.successes.length + cancelResult.failures.length} orders cancelled successfully<br/>
            ${suspendResult.successes.length}/${suspendResult.successes.length + suspendResult.failures.length} orders suspended successfully`}));
      })
      .catch(e => {
        console.error(e);
      });
  } catch (e) {
    console.error('Invalid data : ' + JSON.stringify(e));
  }
}
function handleReset() {
  resetFields();
  for(let i = 1; i < n.value; i++) {
    removeSchemaByFiled([`divider${i}`, `shop${i}`, `orderNum${i}`, `operation${i}`, `reason${i}`, `${i}`]);
  }
  updateSchema({
    field: 'orderNum0',
    componentProps: {
      options: [],
    },
    dynamicDisabled: true,
  });
  selectedShopList.value = {};
  orderListByShop.value = {};
  selectedOrderList.value = {0: []};
  selectableOrderList.value = {};

  n.value = 1;
}
async function add() {
  let promiseList: any[] = [];
  let field = n.value;
  promiseList.push(appendSchemaByField(
    {
      field: `divider${field}`,
      component: 'Divider',
      label: '',
      colProps: {
        span: 24,
        style: {marginBottom: '1.5em'},
      },
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `shop${field}`,
      component: 'JSearchSelect',
      label: t('data.invoice.shop'),
      colProps: {
        span: 6,
      },
      itemProps: {
        labelAlign: 'left',
        labelCol: reactive({
          xs: {span: 4},
          lg: {span: 4},
          xl: {span: 4},
        }),
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 20},
          xl: {span: 20},
        }),
      },
      componentProps: {
        disabled: shopDisabled,
        placeholder: t('data.invoice.shop'),
        dictOptions: shopList,
        onChange: (e: any) => {
          handleShopChange(e, field.toString());
        },
      },
      required: true,
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `orderNum${field}`,
      component: 'JSelectMultiple',
      label: t('data.order.Num') + field,
      colProps: {
        span: 8,
      },
      itemProps: {
        labelCol: reactive({
          xs: { span: 4 },
          lg: { span: 6 },
          xl: { span: 8 },
          xxl: { span: 6 },
        }),
        wrapperCol: reactive({
          xs: { span: 20 },
          lg: { span: 18 },
          xl: { span: 16 },
          xxl: { span: 18 },
        }),
      },
      componentProps: {
        placeholder: t('data.order.Num'),
        options: [],
        onChange: (e: any) => {
          handleOrdersChange(e, field.toString());
        },
      },
      labelWidth: 100,
      required: true,
      dynamicDisabled: true,
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `operation${field}`,
      component: 'Select',
      label: t('common.operation.action'),
      colProps: {
        span: 8,
      },
      componentProps: {
        placeholder: t("common.operation.action"),
        options: [
          {label: t('common.operation.cancel'), value: 'Cancel'},
          {label: 'Suspend', value: 'Suspend'},
        ]
      },
      required: true,
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `${field}`,
      component: 'Input',
      label: '',
      colProps: {
        span: 1,
        style: {marginLeft: '10px'},
      },
      slot: 'add',
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `reason${field}`,
      component: 'InputTextArea',
      label: 'Reason',
      colProps: {
        span: 24,
      },
      itemProps: {
        labelAlign: 'left',
        labelCol: reactive({
          xs: {span: 2},
          lg: {span: 2},
          xl: {span: 2},
        }),
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 20},
          xl: {span: 20},
        }),
      },
      componentProps: {
        placeholder: 'Reason',
        rows: 2,
        itemProps: {
          labelCol: reactive({
            xs: {span: 0},
          }),
          wrapperCol: reactive({
            xs: {span: 24},
          }),
        },
      },
      required: true,
    },
    ''
  ));
  await Promise.all(promiseList).then(() => {
    n.value++;
  });
}

function del(field:string) {
  let shop = selectedShopList.value[field];
  removeSchemaByFiled([`divider${field}`, `shop${field}`, `orderNum${field}`, `operation${field}`, `reason${field}`, `${field}`]);
  addOrdersToSelectableList(shop, field);
  updateSameShopOrderField(shop, field);
  let shopIsUsed = false;
  for(let fieldNum in selectedShopList) {
    if(selectedShopList.value[fieldNum] === shop && fieldNum !== field) {
      shopIsUsed = true;
      break;
    }
  }
  if(!shopIsUsed) delete orderListByShop.value[shop];
  delete selectedShopList.value[field];
  n.value = parseInt(field) < n.value-1 ? n.value : n.value-1;
}

</script>

<template>
  <a-tooltip v-if="client !== null" placement="bottom" class="fixed bottom-12 right-18 z-10">
    <template #title>
      <span>Add row</span>
    </template>
    <Button @click="add" type="success" id="addRow">+</Button>
  </a-tooltip>
  <PageWrapper
    title="Orders Management Page"
  >
    <template #headerContent>
      <a-button @click="openHelpModal" type="warning" id="helpButton">Help</a-button>
    </template>
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
          <Button v-if="getFieldNum(field) > 0" @click="del(field)" type="error">-</Button>
        </template>
      </BasicForm>
    </Card>
  </PageWrapper>
  <orders-management-help-modal @success="" @guide="startGuide" @register="registerModal"/>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import {Card, Form, Modal} from 'ant-design-vue';
import BasicForm from "@/components/Form/src/BasicForm.vue";
import {Button} from "@/components/Button";

import {FormSchema, useForm} from "@/components/Form";
import {h, onMounted, reactive, ref} from 'vue';
import {useI18n} from "@/hooks/web/useI18n";

import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/client.api";
import {
  OperationEnum,
  OrderActionParam, OrderActionResponse,
  PlatformOrderOption,
  PlatformOrderOptionsMap, Recipient
} from "@/views/business/client/orders/Interfaces";
import {useMessage} from "@/hooks/web/useMessage";
import {useModal} from "@/components/Modal";
import OrdersManagementHelpModal
  from "@/views/business/client/_components/OrdersManagementHelpModal.vue";
import {startGuide} from "@/views/business/client/orders/OrdersManagement.data";

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

const operationOptions: {label:string; value:string; disabled?:boolean|undefined}[] = [
  {label: 'Cancel', value: OperationEnum.CANCEL, disabled: false},
  {label: 'Suspend', value: OperationEnum.SUSPEND, disabled: false},
  {label: 'Edit recipient\'s information', value: OperationEnum.EDIT, disabled: false},
];

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
      id: 'shop0',
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
      id: 'orderNum0',
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
    dynamicDisabled: true,
    colProps: {
      span: 8,
    },
    itemProps: {
      id: 'operation0',
      labelCol: {
        xs: { span: 4 },
        lg: { span: 6 },
        xl: { span: 8 },
        xxl: { span: 6 },
      },
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 18 },
        xl: { span: 16 },
        xxl: { span: 18 },
      }),
    },
    componentProps: {
      placeholder: t("common.operation.action"),
      options: operationOptions,
      onChange: (e: any) => {
        handleOperationChange(e, '0');
      },
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.actionInput')
      },
    ],
  },
  {
    field: 'add0',
    component: 'Input',
    label: '',
    colProps: {
      span: 1,
      style: {marginLeft: '10px'},
    },
    itemProps: {
      id: 'add0',
    },
    slot: 'add',
  },
  {
    field: 'reason0',
    component: 'InputTextArea',
    label: t('data.order.reason'),
    ifShow: false,
    colProps: {
      span: 22,
    },
    itemProps: {
      id: 'reason0',
      labelAlign: 'left',
      labelCol: reactive({
        xs: { span: 2 },
        lg: { span: 2 },
        xl: { span: 2 },
        xxl: { span: 2 },
      }),
      wrapperCol: reactive({
        xs: { span: 22 },
        lg: { span: 22 },
        xl: { span: 22 },
        xxl: { span: 22 },
      }),
    },
    componentProps: {
      placeholder: t('data.order.reason'),
      rows: 2,
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.reasonInputText'),
        type: 'string',
      },
    ],
  },
  {
    field: `recipient0`,
    component: 'Input',
    label: `${t('data.recipient.recipient')}`,
    dynamicDisabled: true,
    ifShow: false,
    colProps: {
      span: 12,
    },
    itemProps: {
      id: 'recipient0',
      labelAlign: 'left',
      labelCol: reactive({
        xs: {span: 6},
        lg: {span: 6},
        xl: {span: 6},
        xxl: {span: 4},
      }),
      wrapperCol: reactive({
        xs: {span: 18},
        lg: {span: 18},
        xl: {span: 18},
        xxl: {span: 20},
      }),
    },
    componentProps: {
      placeholder: t('data.recipient.recipient'),
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.recipientInputText'),
        type: 'string',
      },
    ],
  },
  {
    field: `phone0`,
    component: 'Input',
    label: `${t('data.recipient.phoneNumber')}`,
    dynamicDisabled: true,
    ifShow: false,
    colProps: {
      span: 10,
    },
    itemProps: {
      id: 'phone0',
      labelAlign: 'right',
      labelCol: reactive({
        xs: {span: 6},
        lg: {span: 6},
        xl: {span: 6},
        xxl: {span: 6},
      }),
      wrapperCol: reactive({
        xs: {span: 18},
        lg: {span: 18},
        xl: {span: 18},
      }),
    },
    componentProps: {
      placeholder: t('data.recipient.phoneNumber'),
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.phoneInput'),
        type: 'string',
      },
    ],
  },
  {
    field: `street1-0`,
    component: 'Input',
    label: `${t('data.recipient.address')} 1`,
    dynamicDisabled: true,
    ifShow: false,
    colProps: {
      span: 12,
    },
    itemProps: {
      id: 'street1-0',
      labelAlign: 'left',
      labelCol: reactive({
        xs: { span: 4 },
        lg: { span: 4 },
        xl: { span: 6 },
        xxl: { span: 4 },
      }),
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 20 },
        xl: { span: 18 },
        xxl: { span: 20 },
      }),
    },
    componentProps: {
      placeholder: t('data.recipient.address') + " 1",
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.addressInput'),
        type: 'string',
      },
    ],
  },
  {
    field: `street2-0`,
    component: 'Input',
    label: `${t('data.recipient.address')} 2`,
    dynamicDisabled: true,
    ifShow: false,
    colProps: {
      span: 10,
    },
    itemProps: {
      id: 'street2-0',
      labelAlign: 'right',
      labelCol: reactive({
        xs: { span: 4 },
        lg: { span: 4 },
        xl: { span: 6 },
        xxl: { span: 6 },
      }),
      wrapperCol: reactive({
        xs: { span: 20 },
        lg: { span: 20 },
        xl: { span: 18 },
        xxl: { span: 18 },
      }),
    },
    componentProps: {
      placeholder: t('data.recipient.address') + " 2",
    },
    rules: [
      {
        required: true,
        message: t('component.searchForm.addressInput'),
        type: 'string',
      },
    ],
  },
];
const [register, { appendSchemaByField, removeSchemaByFiled, validate, resetFields, resetSchema, updateSchema, setFieldsValue }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: true,
  submitButtonOptions: { text: t('common.operation.submit'), preIcon: '' },
  // resetButtonOptions: {text: t('common.operation.reset'), preIcon: 'ic:baseline-restart-alt'},
  actionColOptions:{
    xs: 24,
    lg: 24,
    xl: 24,
    xxl: 24,
    style: { textAlign: 'left' }
  },
  submitFunc: handleSubmit,
  resetFunc: handleReset,
});

const [registerModal, {openModal}] = useModal();
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
    .finally(() => {
      if(localStorage.clientOrdersManagementGuideWatched !== 'true') {
        startGuide(client.value.firstName);
      }
    });
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
    defHttp.get({url: Api.getOrdersByShop, params: {shopID: shopId}})
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
    let orderIds: string[] = orderList.split(',');
    selectedOrderList.value[field] = orderIds;
    selectableOrderList.value[shop] = selectableOrderList.value[shop].filter(
      orderOption => !orderIds.includes(orderOption.value)
    );
    let options = JSON.parse(JSON.stringify(operationOptions));// deep clone operationOptions
    if(orderIds.length > 1) {
      options.filter(option => option.value === OperationEnum.EDIT)[0].disabled = true;
    }
    updateSchema(
      {
        field: `operation${field}`,
        dynamicDisabled: false,
        componentProps: {
          options: options,
          }
      }
    ).then(() => {
    }).catch(e => {
      console.error('Error while updating schema : ' + e);
    });
  }
  else {
    addOrdersToSelectableList(shop, field);
    // disable operation field if no order is selected
    updateSchema({
      field: `operation${field}`,
      dynamicDisabled: true,
    });
  }
  updateSameShopOrderField(shop, field);
  setFieldsValue({[`operation${field}`]: null});
  disableRecipientFields(field, false, true, false);
}
function handleOperationChange(operation: string, field: string) {
  if(typeof operation === 'undefined')
    disableRecipientFields(field, false, true, false);
  else if(operation === OperationEnum.EDIT) {
    if(selectedOrderList.value[field].length > 1 || selectedOrderList.value[field].length === 0 || !selectedOrderList.value.hasOwnProperty(field))
      disableRecipientFields(field, true, true);
    else {
      disableRecipientFields(field, true, true);
      getRecipientInfo(selectedOrderList.value[field][0]).then((res: Recipient) => {
        setFieldsValue(
          {
            [`recipient${field}`]: res.recipient,
            [`phone${field}`]: res.phone,
            [`street1-${field}`]: res.street1,
            [`street2-${field}`]: res.street2,
          }
        )
      }).finally(() => {
        disableRecipientFields(field, true, false, undefined, false);
      });

    }
  }
  else {
    disableRecipientFields(field, false, true);
  }
}
function getRecipientInfo(orderId: string) {
  return defHttp.get({url: Api.getRecipientInfo, params: {orderId: orderId}});
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

/**
 * Updates orderNum fields of other fields with the same shop, eg: when shop is changed or order is selected,
 * then previously selected orders in other fields will be re-added to selectable list
 * @param shop
 * @param field
 */
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
  Modal.confirm({
    title: t('common.operation.confirm'),
    content: h('span', {'innerHTML': 'Confirm submitting: <b>' + n.value + '</b> operations ?'}),
    okText: t('component.drawer.okText'),
    cancelText: t('component.drawer.cancelText'),
    centered: true,
    onOk: async () => {
      const data = await validate();
      let params:OrderActionParam[] = [];
      for(let i = 0; i < n.value; i++) {
        let shop:string = data[`shop${i}`];
        let orders:string = data[`orderNum${i}`];
        let operation:string = data[`operation${i}`];
        if(!shop || !orders || !operation) {
          console.error('Invalid data : ' + JSON.stringify(data));
          throw new Error('Invalid data : ' + JSON.stringify(data));
        }
        let param:OrderActionParam = {
          shopId: shop,
          orderIds: orders,
          action: operation,
        };
        if(operation === OperationEnum.EDIT) {
          let recipient:string = data[`recipient${i}`];
          let phone:string = data[`phone${i}`];
          let street1:string = data[`street1-${i}`];
          let street2:string = data[`street2-${i}`];
          if(recipient && phone && street1 && street2) {
            param.recipient = recipient;
            param.phone = phone;
            param.street1 = street1;
            param.street2 = street2;
          }
        }
        else if(operation === OperationEnum.CANCEL || operation === OperationEnum.SUSPEND) {
          let reason:string = data[`reason${i}`];
          if(reason) {
            param.reason = reason;
          }
        }
        else {
          console.error('Invalid operation : ' + operation);
          throw new Error('Invalid operation : ' + operation);
        }
        params.push(param);
      }
      defHttp.post({url: Api.postOrders, params: params})
        .then(res => {
          const cancelResult: OrderActionResponse = res.cancelResult;
          const suspendResult: OrderActionResponse = res.suspendResult;
          const editResult: OrderActionResponse = res.editResult;
          createMessage.info(h('span', {'innerHTML': `${cancelResult.successes.length}/${cancelResult.successes.length + cancelResult.failures.length} orders cancelled successfully<br/>
          ${suspendResult.successes.length}/${suspendResult.successes.length + suspendResult.failures.length} orders suspended successfully<br/>
          ${editResult.successes.length}/${editResult.successes.length + editResult.failures.length} orders edited successfully<br/>`}));
          handleReset();
        })
        .catch(e => {
          console.error(e);
        });
    }
  });
}
async function resetField0Values() {
  await setFieldsValue({
    shop0: undefined,
    orderNum0: undefined,
    operation0: undefined,
    reason0: undefined,
    recipient0: undefined,
    street1: undefined,
    street2: undefined,
    phone0: undefined
  });
}
async function handleReset() {
  for (let i = 1; i < n.value; i++) {
    await removeSchemaByFiled([`divider${i}`, `shop${i}`, `orderNum${i}`, `operation${i}`, `reason${i}`, `add${i}`, `recipient${i}`, `street1-${i}`, `street2-${i}`, `phone${i}`]);
  }
  await resetField0Values();
  await updateSchema({
    field: 'operation0',
    componentProps: {
      options: operationOptions,
    },
    dynamicDisabled: true,
  });
  await updateSchema({
    field: 'orderNum0',
    componentProps: {
      options: [],
    },
    dynamicDisabled: true,
  });
  await updateSchema({
    field: 'phone0',
    dynamicDisabled: true,
    ifShow: false,
  });
  await updateSchema({
    field: 'recipient0',
    dynamicDisabled: true,
    ifShow: false,
  });
  await updateSchema({
    field: 'street1-0',
    dynamicDisabled: true,
    ifShow: false,
  });
  await updateSchema({
    field: 'street2-0',
    dynamicDisabled: true,
    ifShow: false,
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
      label: `Entry n°${field + 1}`,
      colProps: {
        span: 24,
        style: {marginBottom: '1.5em', marginTop: '1.5em'},
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
        id: `shop${field}`,
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
        id: `orderNum${field}`,
        labelCol: reactive({
          xs: {span: 4},
          lg: {span: 6},
          xl: {span: 8},
          xxl: {span: 6},
        }),
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 18},
          xl: {span: 16},
          xxl: {span: 18},
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
      itemProps: {
        id: `operation${field}`,
        labelCol: {
          xs: {span: 4},
          lg: {span: 6},
          xl: {span: 8},
          xxl: {span: 6},
        },
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 18},
          xl: {span: 16},
          xxl: {span: 18},
        }),
      },
      componentProps: {
        placeholder: t("common.operation.action"),
        options: operationOptions,
        onChange: (e: any) => {
          handleOperationChange(e, field.toString());
        },
      },
      required: true,
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `add${field}`,
      component: 'Input',
      label: '',
      colProps: {
        span: 1,
        style: {marginLeft: '10px'},
      },
      itemProps: {
        id: `add${field}`,
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
      ifShow: false,
      colProps: {
        span: 22,
      },
      itemProps: {
        id: `reason${field}`,
        labelAlign: 'left',
        labelCol: reactive({
          xs: {span: 2},
          lg: {span: 2},
          xl: {span: 2},
          xxl: {span: 2},
        }),
        wrapperCol: reactive({
          xs: {span: 22},
          lg: {span: 22},
          xl: {span: 22},
          xxl: {span: 22},
        }),
      },
      componentProps: {
        placeholder: 'Reason',
        rows: 2,
      },
      required: true,
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `recipient${field}`,
      component: 'Input',
      label: `${t('data.recipient.recipient')}`,
      dynamicDisabled: true,
      ifShow: false,
      colProps: {
        span: 12,
      },
      itemProps: {
        id: `recipient${field}`,
        labelAlign: 'left',
        labelCol: reactive({
          xs: {span: 6},
          lg: {span: 6},
          xl: {span: 6},
          xxl: {span: 4},
        }),
        wrapperCol: reactive({
          xs: {span: 18},
          lg: {span: 18},
          xl: {span: 18},
          xxl: {span: 20},
        }),
      },
      componentProps: {
        placeholder: t('data.recipient.recipient'),
      }
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `phone${field}`,
      component: 'Input',
      label: `${t('data.recipient.phoneNumber')}`,
      dynamicDisabled: true,
      ifShow: false,
      colProps: {
        span: 10,
      },
      itemProps: {
        id: `phone${field}`,
        labelAlign: 'right',
        labelCol: reactive({
          xs: {span: 6},
          lg: {span: 6},
          xl: {span: 6},
          xxl: {span: 6},
        }),
        wrapperCol: reactive({
          xs: {span: 18},
          lg: {span: 18},
          xl: {span: 18},
        }),
      },
      componentProps: {
        placeholder: t('data.recipient.phoneNumber'),
      }
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `street1-${field}`,
      component: 'Input',
      label: `${t('data.recipient.address')} 1`,
      dynamicDisabled: true,
      ifShow: false,
      colProps: {
        span: 12,
      },
      itemProps: {
        id: `street1-${field}`,
        labelAlign: 'left',
        labelCol: reactive({
          xs: {span: 4},
          lg: {span: 4},
          xl: {span: 6},
          xxl: {span: 4},
        }),
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 20},
          xl: {span: 18},
          xxl: {span: 20},
        }),
      },
      componentProps: {
        placeholder: t('data.recipient.address') + " 1",
      },
    },
    ''
  ));
  promiseList.push(appendSchemaByField(
    {
      field: `street2-${field}`,
      component: 'Input',
      label: `${t('data.recipient.address')} 2`,
      dynamicDisabled: true,
      ifShow: false,
      colProps: {
        span: 10,
      },
      itemProps: {
        id: `street2-${field}`,
        labelAlign: 'right',
        labelCol: reactive({
          xs: {span: 4},
          lg: {span: 4},
          xl: {span: 6},
          xxl: {span: 6},
        }),
        wrapperCol: reactive({
          xs: {span: 20},
          lg: {span: 20},
          xl: {span: 18},
          xxl: {span: 18},
        }),
      },
      componentProps: {
        placeholder: t('data.recipient.address') + " 2",
      },
    },
    ''
  ));
  await Promise.all(promiseList).then(() => {
    n.value++;
  });
}

function del(field:string) {
  const fieldNum = getFieldNum(field).toString();
  let shop = selectedShopList.value[fieldNum];
  removeSchemaByFiled([`divider${fieldNum}`, `shop${fieldNum}`, `orderNum${fieldNum}`, `operation${fieldNum}`, `reason${fieldNum}`, `add${fieldNum}`, `recipient${fieldNum}`, `street1-${fieldNum}`, `street2-${fieldNum}`, `phone${fieldNum}`]);
  addOrdersToSelectableList(shop, fieldNum);
  updateSameShopOrderField(shop, fieldNum);
  let shopIsUsed = false;
  for(let fieldNumber in selectedShopList) {
    if(selectedShopList.value[fieldNumber] === shop && fieldNumber !== fieldNum) {
      shopIsUsed = true;
      break;
    }
  }
  if(!shopIsUsed) delete orderListByShop.value[shop];
  delete selectedShopList.value[fieldNum];
  n.value = parseInt(fieldNum) < n.value-1 ? n.value : n.value-1;
}
function disableRecipientFields(field:string, show: boolean, disabled: boolean, showAll?: boolean, clear: boolean = true) {
  if(clear) {
    setFieldsValue(
      {
        [`reason${field}`]: '',
        [`recipient${field}`]: '',
        [`phone${field}`]: '',
        [`street1-${field}`]: '',
        [`street2-${field}`]: '',
      }
    );
  }
  updateSchema(
    {
      field: `reason${field}`,
      dynamicDisabled: showAll !== undefined ? !showAll : show,
      ifShow: showAll !== undefined ? showAll : !show,
      required: showAll !== undefined ? true : !show,
    }
  )
  updateSchema(
    {
      field: `recipient${field}`,
      dynamicDisabled: showAll !== undefined ? !showAll : disabled,
      ifShow: showAll !== undefined ? showAll : show,
      itemProps: {
        extra: show && disabled ? h('span', {'innerHTML': 'You must select only <b>one</b> order if you want to edit recipient\'s information'}) : '',
      },
      required: showAll !== undefined ? true : show,
    }
  );
  updateSchema(
    {
      field: `phone${field}`,
      dynamicDisabled: showAll !== undefined ? !showAll : disabled,
      ifShow: showAll !== undefined ? showAll : show,
      required: showAll !== undefined ? true : show,
    }
  );
  updateSchema(
    {
      field: `street1-${field}`,
      dynamicDisabled: showAll !== undefined ? !showAll : disabled,
      ifShow: showAll !== undefined ? showAll : show,
      required: showAll !== undefined ? true : show,
    }
  );
  updateSchema(
    {
      field: `street2-${field}`,
      dynamicDisabled: showAll !== undefined ? !showAll : disabled,
      ifShow: showAll !== undefined ? showAll : show,
      required: showAll !== undefined ? true : show,
    }
  );
}
function openHelpModal() {
  openModal(true, { })
}
function getFieldNum(field: string):number {
  const regex = /(\d+)/g;
  let match: string[] | null = field.match(regex);
  if(match!=null)
    return parseInt(match[match.length-1]);
  return -1;
}
</script>

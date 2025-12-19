import { Modal, message } from 'ant-design-vue';
import { getPendingOrdersAlert } from '/@/api/sys/user';
import { h } from 'vue';
import { exportPendingOrdersAlert } from '/@/api/sys/user';
function copyAllPlatformOrderIds(grouped: Record<string, any[]>) {
  const orderIds: string[] = [];
  Object.values(grouped).forEach(list => {
    list.forEach(item => {
      if (item.platformOrderId) {
        orderIds.push(item.platformOrderId);
      }
    });
  });
  if (orderIds.length === 0) {
    message.warning('没有可复制的订单号');
    return;
  }
  navigator.clipboard.writeText(orderIds.join('\n'));
  message.success(`已复制 ${orderIds.length} 个订单号`);
}
async function downloadExcel() {
  const res = await exportPendingOrdersAlert();
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pending_orders.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}
export async function checkPendingOrders() {
  if (localStorage.getItem('pendingOrderAlertShown') === 'true') return;
  const res = await getPendingOrdersAlert();
  if (!Array.isArray(res) || res.length === 0) return;
  const grouped: Record<string, any[]> = {};
  res.forEach(item => {
    const client = item.clientInternalCode || '未知客户';
    if (!grouped[client]) grouped[client] = [];
    grouped[client].push(item);
  });
  Modal.confirm({
    title: '异常待处理订单提醒',
    width: 750,
    okText: '我知道了',
    okCancel: false,
    maskClosable: false,
    content: () =>
      h('div', { class: 'pending-modal' }, [
        h(
          'div',
          { class: 'excel-export' },
          [
            h(
              'a',
              {
                style: 'margin-right: 12px;',
                onClick: () => copyAllPlatformOrderIds(grouped)
              },
              '复制所有订单号'
            ),
            h(
              'a',
              { onClick: downloadExcel},
              '下载Excel'
            )
          ]
        ),
        ...Object.keys(grouped).map(client =>
          h('div', { class: 'client-block' }, [

            h('div', { class: 'client-title' }, `客户：${client}`),

            h('div', { class: 'table' }, [
              h('div', { class: 'col' }, [
                h('div', { class: 'cell header' }, '店铺'),
                ...grouped[client].map(item =>
                  h('div', { class: 'cell' }, [
                    item.shopName,
                    h('br')
                  ])
                )
              ]),
              h('div', { class: 'col' }, [
                h('div', { class: 'cell header' }, '等待天数'),
                ...grouped[client].map(item =>
                  h('div', { class: 'cell waiting' }, [
                    `${item.waitingDays} 天`,
                    h('br')
                  ])
                )
              ]),
              h('div', { class: 'col' }, [
                h('div', { class: 'cell header' }, '订单号'),
                ...grouped[client].map(item =>
                  h('div', { class: 'cell' }, [
                    item.platformOrderId,
                    h('br')
                  ])
                )
              ])
            ])
          ])
        ),
        h(
          'style',
          {},
          `
          .pending-modal {
            max-height: 380px;
            overflow-y: auto;
            padding-right: 12px;
            font-size: 14px;
            color: #333;
          }
          .excel-export {
            text-align: right;
            margin-bottom: 8px;
          }
          .excel-export a {
            color: #1677ff;
            cursor: pointer;
            font-size: 13px;
          }
          .client-block {
            margin-bottom: 22px;
          }
          .client-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1677ff;
          }
          .table {
            display: grid;
            grid-template-columns: 160px 120px 1fr;
          }
          .col {
            display: flex;
            flex-direction: column;
            user-select: text;
          }
          .cell {
            padding: 6px 4px;
            border-bottom: 1px dashed #eee;
            cursor: default;
          }
          .cell:hover {
            background: #f5f7fa;
          }
          .header {
            font-weight: bold;
            border-bottom: 1px solid #ddd;
          }
          .waiting {
            color: #fa541c;
            font-weight: 600;
          }
        `
        )
      ])
  });
  localStorage.setItem('pendingOrderAlertShown', 'true');
}

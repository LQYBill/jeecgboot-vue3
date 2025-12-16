import { Modal } from 'ant-design-vue';
import { getPendingOrdersAlert } from '/@/api/sys/user';
import { h } from 'vue';
export async function checkPendingOrders() {
  if (localStorage.getItem("pendingOrderAlertShown") === "true") {
    return;
  }
  const res = await getPendingOrdersAlert();
  if (!Array.isArray(res) || res.length === 0) return;
  const grouped = {};
  res.forEach(item => {
    const client = item.clientInternalCode || "未知客户";
    if (!grouped[client]) grouped[client] = [];
    grouped[client].push(item);
  });
  Modal.confirm({
    title: "异常待处理订单提醒",
    width: 750,
    okText: "我知道了",
    cancelButtonProps: {
      style: "display: none"
    },
    maskClosable: false,
    content: () =>
      h(
        'div',
        {
          style: `
            max-height: 380px;
            overflow-y: auto;
            padding-right: 12px;
            font-size: 14px;
            color: #333;
          `
        },
        Object.keys(grouped).map(client =>
          h('div', { style: "margin-bottom: 22px;" }, [
            h(
              'div',
              {
                style: `
                  font-size: 16px;
                  font-weight: 600;
                  margin-bottom: 8px;
                  color: #1677ff;
                `
              },
              `客户：${client}`
            ),
            h(
              'div',
              {
                style: `
                  display: grid;
                  grid-template-columns: 160px 120px 1fr;
                  font-weight: bold;
                  padding: 6px 0;
                  border-bottom: 1px solid #ddd;
                `
              },
              [
                h('span', null, "店铺"),
                h('span', null, "等待天数"),
                h('span', null, "订单号")
              ]
            ),
            ...grouped[client].map(item =>
              h(
                'div',
                {
                  style: `
                    display: grid;
                    grid-template-columns: 160px 120px 1fr;
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                    align-items: center;
                  `
                },
                [
                  h('span', null, item.shopName),

                  h(
                    'span',
                    {
                      style: `color:#fa541c; font-weight:600;`
                    },
                    `${item.waitingDays} 天`
                  ),

                  h('span', null, item.platformOrderId)
                ]
              )
            )
          ])
        )
      )
  });
  localStorage.setItem("pendingOrderAlertShown", "true");
}

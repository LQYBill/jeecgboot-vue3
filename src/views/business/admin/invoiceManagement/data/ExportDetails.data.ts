import {FormSchema} from "@/components/Form";

export const exportDetailsFormSchema: FormSchema[] = [
  {
    field: 'client',
    label: 'Client',
    component: 'JSearchSelect',
    componentProps : {
      style: {  },
      showSearch: true,
      placeholder: 'Client',
      onChange: (value: any) => {
        console.log('onChange', value);
      },
    },
    required: true,
  }
];

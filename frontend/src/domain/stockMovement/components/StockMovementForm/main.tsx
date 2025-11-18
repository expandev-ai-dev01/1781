import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStockMovementCreate } from '../../hooks';
import { StockMovementType } from '../../types';
import type { StockMovementFormProps } from './types';

const formSchema = z.object({
  idProduct: z.number().int().positive({ message: 'Selecione um produto' }),
  movementType: z.number().refine((val) => Object.values(StockMovementType).includes(val), {
    message: 'Selecione um tipo de movimentação',
  }),
  quantity: z.number().refine((val) => val !== 0, { message: 'Quantidade não pode ser zero' }),
  reason: z
    .string()
    .min(5, 'Motivo deve ter pelo menos 5 caracteres')
    .max(200, 'Motivo deve ter no máximo 200 caracteres'),
  referenceDocument: z.string().max(50).optional().nullable(),
  unitValue: z.number().positive().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export const StockMovementForm = ({
  onSuccess,
  onCancel,
  defaultProductId,
}: StockMovementFormProps) => {
  const { create, isCreating } = useStockMovementCreate({
    onSuccess: (data) => {
      reset();
      onSuccess?.(data);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idProduct: defaultProductId,
      movementType: StockMovementType.Entry,
      quantity: 0,
      reason: '',
      referenceDocument: null,
      unitValue: null,
      location: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    await create(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
        <input
          type="number"
          {...register('idProduct', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.idProduct && (
          <p className="text-sm text-red-600 mt-1">{errors.idProduct.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Movimentação *
        </label>
        <select
          {...register('movementType', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={StockMovementType.NewProduct}>Novo Produto</option>
          <option value={StockMovementType.Entry}>Entrada</option>
          <option value={StockMovementType.Exit}>Saída</option>
          <option value={StockMovementType.Adjustment}>Ajuste</option>
          <option value={StockMovementType.Deletion}>Exclusão</option>
        </select>
        {errors.movementType && (
          <p className="text-sm text-red-600 mt-1">{errors.movementType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
        <input
          type="number"
          step="0.01"
          {...register('quantity', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
        <textarea
          {...register('reason')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documento de Referência
        </label>
        <input
          type="text"
          {...register('referenceDocument')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.referenceDocument && (
          <p className="text-sm text-red-600 mt-1">{errors.referenceDocument.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
        <input
          type="number"
          step="0.01"
          {...register('unitValue', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.unitValue && (
          <p className="text-sm text-red-600 mt-1">{errors.unitValue.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
        <input
          type="text"
          {...register('location')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>}
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isCreating}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCreating}
        >
          {isCreating ? 'Registrando...' : 'Registrar Movimentação'}
        </button>
      </div>
    </form>
  );
};

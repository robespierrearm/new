'use client';

import { useState, useEffect } from 'react';
import { Tender, DocumentType, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, BarChart3, FileText, Receipt, ChevronDown, ChevronUp, Hash, TrendingDown } from 'lucide-react';
import { TenderDocumentsModal } from '@/components/TenderDocumentsModal';
import { TenderFinancialModal } from '@/components/TenderFinancialModal';

interface TenderCardExpandedProps {
  tender: Tender;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TenderCardExpanded({ tender, isExpanded, onToggle }: TenderCardExpandedProps) {
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('прочее');
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [materialCounts, setMaterialCounts] = useState({
    'тендерная документация': 0,
    'закрывающие документы': 0,
  });

  // Загрузка счетчиков материалов
  const loadMaterialCounts = async () => {
    try {
      // Загружаем файлы
      const { data: files } = await supabase
        .from('files')
        .select('document_type')
        .eq('tender_id', tender.id);

      // Загружаем ссылки
      const { data: links } = await supabase
        .from('tender_links')
        .select('document_type')
        .eq('tender_id', tender.id);

      // Считаем материалы по типам
      const counts = {
        'тендерная документация': 0,
        'закрывающие документы': 0,
      };

      // Считаем файлы
      files?.forEach(file => {
        if (file.document_type === 'тендерная документация') {
          counts['тендерная документация']++;
        } else if (file.document_type === 'закрывающие документы') {
          counts['закрывающие документы']++;
        }
      });

      // Считаем ссылки
      links?.forEach(link => {
        if (link.document_type === 'тендерная документация') {
          counts['тендерная документация']++;
        } else if (link.document_type === 'закрывающие документы') {
          counts['закрывающие документы']++;
        }
      });

      setMaterialCounts(counts);
    } catch (error) {
      console.error('Ошибка загрузки счетчиков:', error);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadMaterialCounts();
    }
  }, [isExpanded, tender.id]);

  const openGoogleMaps = () => {
    if (!tender.region) return;
    const query = encodeURIComponent(tender.region);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Расчёт снижения цены
  const calculateReduction = () => {
    if (!tender.start_price || !tender.submitted_price) return null;
    
    const reduction = tender.start_price - tender.submitted_price;
    const percentage = (reduction / tender.start_price) * 100;
    
    return {
      amount: reduction,
      percentage: percentage,
    };
  };

  const reduction = calculateReduction();

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Раскрывающееся содержимое */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Номер гос закупки и снижение */}
          {(tender.purchase_number || reduction) && (
            <div className="flex flex-wrap gap-2">
              {/* Номер гос закупки */}
              {tender.purchase_number && (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md border border-blue-200">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">№ {tender.purchase_number}</span>
                </div>
              )}

              {/* Снижение цены */}
              {reduction && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-md border border-green-200">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">
                    {formatAmount(reduction.amount)}
                  </span>
                  <span className="text-xs opacity-75">
                    ({reduction.percentage.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Регион / Адрес */}
          {tender.region && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Регион / Адрес</h4>
                  </div>
                  <p className="text-sm text-gray-700">{tender.region}</p>
                </div>
                <Button
                  onClick={openGoogleMaps}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Показать на карте</span>
                  <span className="sm:hidden">Карта</span>
                </Button>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Финансовая сводка */}
            <Button
              onClick={() => setFinancialModalOpen(true)}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto py-3 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300"
            >
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Финансовая сводка</div>
                <div className="text-xs opacity-75">Доходы и расходы</div>
              </div>
            </Button>

            {/* Тендерная документация */}
            <Button
              onClick={() => {
                setSelectedDocType('тендерная документация');
                setDocumentsModalOpen(true);
              }}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto py-3 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">
                  Тендерная документация
                  {materialCounts['тендерная документация'] > 0 && (
                    <span className="ml-1">({materialCounts['тендерная документация']})</span>
                  )}
                </div>
                <div className="text-xs opacity-75">Документы тендера</div>
              </div>
            </Button>

            {/* Закрывающие документы */}
            <Button
              onClick={() => {
                setSelectedDocType('закрывающие документы');
                setDocumentsModalOpen(true);
              }}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto py-3 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              <Receipt className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">
                  Закрывающие документы
                  {materialCounts['закрывающие документы'] > 0 && (
                    <span className="ml-1">({materialCounts['закрывающие документы']})</span>
                  )}
                </div>
                <div className="text-xs opacity-75">Акты, счета</div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Модальные окна */}
      <TenderDocumentsModal
        open={documentsModalOpen}
        onOpenChange={setDocumentsModalOpen}
        tenderId={tender.id}
        tenderName={tender.name}
        documentType={selectedDocType}
        onMaterialsChange={loadMaterialCounts}
      />

      <TenderFinancialModal
        open={financialModalOpen}
        onOpenChange={setFinancialModalOpen}
        tender={tender}
      />
    </>
  );
}

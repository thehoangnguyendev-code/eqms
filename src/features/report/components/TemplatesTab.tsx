import { useState, useMemo, useCallback } from 'react';
import { FileBarChart, Download, Filter, ShieldAlert, LayoutGrid, List, Settings2, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { InlineLoading } from '@/components/ui/loading/Loading';
import { Select } from '@/components/ui/select/Select';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { DateRangePicker } from '@/components/ui/datetime-picker/DateRangePicker';
import { cn } from '@/components/ui/utils';
import type { ReportType, ReportFormat, ReportPeriod, ReportField } from '../types';
import { REPORT_TEMPLATES, COMPLIANCE_TEMPLATES } from '../mockData';

/**
 * Custom hook managing the Templates & Compliance tabs.
 * Returns `filterElement` (renders inside the unified card) and `contentElement` (renders below).
 */
export function useTemplatesTab(mode: 'templates' | 'compliance') {
  const [reportType, setReportType] = useState<ReportType>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('Monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCustomizer, setShowCustomizer] = useState(false);
  // Map of templateId -> Set of enabled field ids
  const [customFields, setCustomFields] = useState<Record<string, Set<string>>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const filteredTemplates = useMemo(() => {
    const templates = mode === 'compliance' ? COMPLIANCE_TEMPLATES : REPORT_TEMPLATES;
    if (reportType === 'All') return templates;
    return templates.filter((t) => t.type === reportType);
  }, [reportType, mode]);

  // Get the selected template object
  const selectedTemplateObj = useMemo(() => {
    const templates = mode === 'compliance' ? COMPLIANCE_TEMPLATES : REPORT_TEMPLATES;
    return templates.find((t) => t.id === selectedTemplate);
  }, [selectedTemplate, mode]);

  // Get enabled fields for the selected template (initializes from defaults)
  const getEnabledFields = useCallback(
    (templateId: string, fields?: ReportField[]): Set<string> => {
      if (customFields[templateId]) return customFields[templateId];
      if (!fields) return new Set();
      return new Set(fields.filter((f) => f.defaultEnabled).map((f) => f.id));
    },
    [customFields]
  );

  const enabledFields = useMemo(() => {
    if (!selectedTemplateObj?.fields) return new Set<string>();
    return getEnabledFields(selectedTemplateObj.id, selectedTemplateObj.fields);
  }, [selectedTemplateObj, getEnabledFields]);

  // Group fields by their group property
  const groupedFields = useMemo(() => {
    if (!selectedTemplateObj?.fields) return new Map<string, ReportField[]>();
    const groups = new Map<string, ReportField[]>();
    for (const field of selectedTemplateObj.fields) {
      const group = field.group || 'Other';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(field);
    }
    return groups;
  }, [selectedTemplateObj]);

  const handleToggleField = (templateId: string, fieldId: string, fields: ReportField[]) => {
    setCustomFields((prev) => {
      const current = prev[templateId] || new Set(fields.filter((f) => f.defaultEnabled).map((f) => f.id));
      const next = new Set(current);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return { ...prev, [templateId]: next };
    });
  };

  const handleToggleAllInGroup = (templateId: string, groupFields: ReportField[], allEnabled: boolean, allFields: ReportField[]) => {
    setCustomFields((prev) => {
      const current = prev[templateId] || new Set(allFields.filter((f) => f.defaultEnabled).map((f) => f.id));
      const next = new Set(current);
      for (const f of groupFields) {
        if (allEnabled) {
          next.delete(f.id);
        } else {
          next.add(f.id);
        }
      }
      return { ...prev, [templateId]: next };
    });
  };

  const handleResetToDefaults = (templateId: string, fields: ReportField[]) => {
    setCustomFields((prev) => {
      const next = { ...prev };
      delete next[templateId];
      return next;
    });
  };

  const handleSelectAll = (templateId: string, fields: ReportField[]) => {
    setCustomFields((prev) => ({
      ...prev,
      [templateId]: new Set(fields.map((f) => f.id)),
    }));
  };

  const handleDeselectAll = (templateId: string) => {
    setCustomFields((prev) => ({
      ...prev,
      [templateId]: new Set<string>(),
    }));
  };

  const toggleGroupExpanded = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  // Determines whether the customization panel should be rendered
  const hasCustomizerPanel = !!(selectedTemplateObj?.fields?.length);

  // --- Filter section (inside the unified card) ---
  const filterElement = (
    <div className="p-4 lg:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Report Category */}
        <div className="xl:col-span-3">
          <Select
            label="Report Category"
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
            options={
              mode === 'compliance'
                ? [{ label: 'All Compliance Reports', value: 'All' }]
                : [
                    { label: 'All Categories', value: 'All' },
                    { label: 'Document', value: 'Document' },
                    { label: 'Training', value: 'Training' },
                    { label: 'Deviation', value: 'Deviation' },
                    { label: 'CAPA', value: 'CAPA' },
                    { label: 'Change Control', value: 'Change Control' },
                    { label: 'Complaint', value: 'Complaint' },
                    { label: 'Audit', value: 'Audit' },
                    { label: 'Supplier', value: 'Supplier' },
                    { label: 'Risk Management', value: 'Risk Management' },
                    { label: 'Equipment', value: 'Equipment' },
                  ]
            }
          />
        </div>

        {/* Report Period */}
        <div className="xl:col-span-3">
          <Select
            label="Report Period"
            value={reportPeriod}
            onChange={(value) => setReportPeriod(value as ReportPeriod)}
            options={[
              { label: 'Daily', value: 'Daily' },
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Quarterly', value: 'Quarterly' },
              { label: 'Yearly', value: 'Yearly' },
              { label: 'Custom Range', value: 'Custom' },
            ]}
          />
        </div>

        {/* Date range (only if Custom period) */}
        {reportPeriod === 'Custom' && (
          <div className="xl:col-span-3">
            <DateRangePicker
              label="Date Range"
              startDate={dateFrom}
              endDate={dateTo}
              onStartDateChange={setDateFrom}
              onEndDateChange={setDateTo}
              placeholder="Select date range"
            />
          </div>
        )}

        {/* Export Format */}
        <div className="xl:col-span-3">
          <Select
            label="Export Format"
            value={reportFormat}
            onChange={(value) => setReportFormat(value as ReportFormat)}
            options={[
              { label: 'PDF Document', value: 'PDF' },
              { label: 'Excel Spreadsheet', value: 'Excel' },
              { label: 'CSV Data File', value: 'CSV' },
            ]}
          />
        </div>
      </div>
    </div>
  );

  // --- Content section (below the unified card) ---
  const contentElement = (
    <>
      <div className={cn(
        'grid grid-cols-1 gap-5 items-start',
        hasCustomizerPanel && 'lg:grid-cols-12'
      )}>
        {/* Report Templates Grid */}
        <div className={cn(hasCustomizerPanel ? 'lg:col-span-8' : 'col-span-1')}>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="w-full md:w-auto">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              {mode === 'compliance'
                ? 'Regulatory Compliance Reports'
                : 'Standard Report Templates'}
            </h2>
            <p className="text-[11px] md:text-xs text-slate-500 mt-1">
              {mode === 'compliance'
                ? 'Pre-configured reports for EU-GMP, FDA, and other regulatory requirements'
                : 'Select a report template to generate insights from your QMS data'}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs md:text-sm text-slate-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center justify-center h-8 w-8 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center justify-center h-8 w-8 border-l border-slate-200 transition-colors',
                  viewMode === 'list'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    'flex flex-col gap-3 p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-lg',
                          isSelected ? 'bg-emerald-100' : 'bg-slate-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-emerald-600' : 'text-slate-600'
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'absolute -top-1.5 -left-1.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold leading-none',
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        )}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          'font-medium mb-1 text-xs md:text-sm',
                          isSelected ? 'text-emerald-900' : 'text-slate-900'
                        )}
                      >
                        {template.name}
                      </h3>
                      <p className="text-[11px] md:text-xs text-slate-600">{template.description}</p>
                      {template.regulatoryRef && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                          <ShieldAlert className="h-3 w-3" />
                          {template.regulatoryRef}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="flex flex-col divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 text-left transition-all',
                    isSelected
                      ? 'bg-emerald-50/50'
                      : 'bg-white hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold leading-none shrink-0',
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                      isSelected ? 'bg-emerald-100' : 'bg-slate-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'text-emerald-600' : 'text-slate-600'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        'font-medium text-xs md:text-sm',
                        isSelected ? 'text-emerald-900' : 'text-slate-900'
                      )}
                    >
                      {template.name}
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500">{template.description}</p>
                  </div>
                  {template.regulatoryRef && (
                    <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shrink-0">
                      <ShieldAlert className="h-3 w-3" />
                      {template.regulatoryRef}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <FileBarChart className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm md:text-base text-slate-900 font-semibold">No report templates found</p>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

        </div>{/* end templates column */}

        {/* Report Customization Panel */}
        {hasCustomizerPanel && (
          <div className="lg:col-span-4 lg:sticky lg:top-20 self-start">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Panel Header */}
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="flex items-center justify-between w-full px-4 md:px-5 py-3.5 md:py-4 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors',
                showCustomizer ? 'bg-emerald-100' : 'bg-slate-100'
              )}>
                <Settings2 className={cn(
                  'h-4 w-4 transition-colors',
                  showCustomizer ? 'text-emerald-600' : 'text-slate-500'
                )} />
              </div>

              {/* Title + meta */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <h3 className="text-xs md:text-sm font-semibold text-slate-900 whitespace-nowrap">
                    Customize Report Fields
                  </h3>
                  {/* Field count pill */}
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-semibold border',
                    enabledFields.size === (selectedTemplateObj.fields?.length ?? 0)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : enabledFields.size === 0
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  )}>
                    {enabledFields.size}/{selectedTemplateObj.fields?.length ?? 0} fields
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 truncate max-w-[280px] md:max-w-none">
                  {selectedTemplateObj.name}
                </p>
              </div>
            </div>

            {/* Chevron */}
            <div className={cn(
              'flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ml-2 transition-colors',
              showCustomizer ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
            )}>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform duration-200',
                showCustomizer && 'rotate-180'
              )} />
            </div>
          </button>

          {/* Progress bar */}
          {(selectedTemplateObj.fields?.length ?? 0) > 0 && (
            <div className="h-0.5 bg-slate-100 mx-4 md:mx-5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(enabledFields.size / (selectedTemplateObj.fields?.length ?? 1)) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Panel Body */}
          {showCustomizer && (
            <div className="border-t border-slate-200 mt-0.5">
              {/* Quick Actions toolbar */}
              <div className="flex flex-wrap items-center gap-2 px-4 md:px-5 py-3 bg-white border-b border-slate-100">
                <span className="text-[11px] md:text-xs font-medium text-slate-400 shrink-0">
                  Quick select:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleSelectAll(selectedTemplateObj.id, selectedTemplateObj.fields!)}
                  >
                    <ToggleRight className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDeselectAll(selectedTemplateObj.id)}
                  >
                    <ToggleLeft className="h-3 w-3 mr-1" />
                    Deselect All
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleResetToDefaults(selectedTemplateObj.id, selectedTemplateObj.fields!)}
                  >
                    Reset Defaults
                  </Button>
                </div>
              </div>

              {/* Field Groups */}
              <div className="p-3 md:p-4 space-y-2.5">
                {Array.from(groupedFields.entries()).map(([group, fields]) => {
                  const enabledCount = fields.filter((f) => enabledFields.has(f.id)).length;
                  const allEnabled = enabledCount === fields.length;
                  const someEnabled = enabledCount > 0 && !allEnabled;
                  const isExpanded = expandedGroups.has(group) || groupedFields.size <= 3;

                  return (
                    <div
                      key={group}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 bg-slate-50 border-b border-slate-100 transition-colors">
                        <button
                          onClick={() => toggleGroupExpanded(group)}
                          className="flex items-center gap-2 text-left flex-1 min-w-0"
                        >
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 text-slate-400 transition-transform shrink-0',
                              isExpanded && 'rotate-180'
                            )}
                          />
                          <span className="text-[11px] md:text-xs font-semibold text-slate-700 uppercase tracking-wider truncate">
                            {group}
                          </span>
                          {/* Mini progress pill */}
                          <span className={cn(
                            'shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border',
                            allEnabled
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : someEnabled
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          )}>
                            {enabledCount}/{fields.length}
                          </span>
                        </button>

                        {/* Toggle all in group */}
                        <button
                          onClick={() =>
                            handleToggleAllInGroup(
                              selectedTemplateObj.id,
                              fields,
                              allEnabled,
                              selectedTemplateObj.fields!
                            )
                          }
                          className={cn(
                            'flex items-center gap-1 text-[10px] md:text-[11px] font-medium transition-colors px-2 py-1 rounded-lg shrink-0 ml-2',
                            allEnabled
                              ? 'text-emerald-600 hover:bg-emerald-100'
                              : 'text-slate-500 hover:bg-slate-100'
                          )}
                        >
                          {allEnabled ? (
                            <ToggleRight className="h-3.5 w-3.5" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {allEnabled ? 'All on' : 'All off'}
                          </span>
                        </button>
                      </div>

                      {/* Checkboxes Grid */}
                      {isExpanded && (
                        <div className="flex flex-col divide-y divide-slate-100">
                          {fields.map((field) => {
                            const isEnabled = enabledFields.has(field.id);
                            return (
                              <label
                                key={field.id}
                                className={cn(
                                  'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors',
                                  isEnabled ? 'bg-slate-50 hover:bg-slate-100/70' : 'bg-white hover:bg-slate-50'
                                )}
                              >
                                <Checkbox
                                  checked={isEnabled}
                                  onChange={() =>
                                    handleToggleField(
                                      selectedTemplateObj.id,
                                      field.id,
                                      selectedTemplateObj.fields!
                                    )
                                  }
                                />
                                <span className={cn(
                                  'text-[11px] md:text-xs leading-snug',
                                  isEnabled ? 'text-slate-800 font-medium' : 'text-slate-500'
                                )}>
                                  {field.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
          </div>
        )}
      </div>{/* end grid */}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setReportType('All');
            setReportPeriod('Monthly');
            setSelectedTemplate('');
            setDateFrom('');
            setDateTo('');
            setShowCustomizer(false);
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={!selectedTemplate || isGenerating}
          onClick={handleGenerateReport}
        >
          {isGenerating ? (
            <>
              <InlineLoading size="xs" color="#ffffff" />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>
    </>
  );

  return { filterElement, contentElement };
}

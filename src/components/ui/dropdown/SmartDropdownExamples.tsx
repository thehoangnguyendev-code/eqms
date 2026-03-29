import React, { useState, useRef } from 'react';
import { SmartDropdown, DropdownItem, DropdownDivider } from '@/components/ui/dropdown';
import { Select } from '@/components/ui/select';
import { Edit, Trash, Eye, Copy, Download, Share2, Lightbulb, Sparkles } from 'lucide-react';

/**
 * Example: Smart Dropdown Usage
 * 
 * Demonstrates how to use SmartDropdown component with auto-positioning
 */
export const SmartDropdownExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Smart Dropdown Examples</h2>

      {/* Example 1: Basic Dropdown */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">1. Basic Action Menu</h3>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Actions
        </button>

        <SmartDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          triggerRef={buttonRef as React.RefObject<HTMLElement>}
          estimatedHeight={240} // 6 items * 40px
        >
          <DropdownItem icon={<Eye />} onClick={() => console.log('View')}>
            View Details
          </DropdownItem>
          <DropdownItem icon={<Edit />} onClick={() => console.log('Edit')}>
            Edit
          </DropdownItem>
          <DropdownItem icon={<Copy />} onClick={() => console.log('Copy')}>
            Duplicate
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<Share2 />} onClick={() => console.log('Share')}>
            Share
          </DropdownItem>
          <DropdownItem icon={<Download />} onClick={() => console.log('Download')}>
            Download
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem 
            icon={<Trash />} 
            onClick={() => console.log('Delete')}
            destructive
          >
            Delete
          </DropdownItem>
        </SmartDropdown>
      </div>

      {/* Example 2: Enhanced Select */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">2. Smart Select Component</h3>
        <div className="max-w-xs">
          <Select
            label="Document Status"
            value="draft"
            onChange={(val) => console.log('Selected:', val)}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Pending Review', value: 'pending-review' },
              { label: 'Pending Approval', value: 'pending-approval' },
              { label: 'Approved', value: 'approved' },
              { label: 'Effective', value: 'effective' },
              { label: 'Archived', value: 'archived' },
            ]}
            enableSearch
          />
        </div>
        <p className="text-sm text-slate-600">
          <Sparkles className="h-4 w-4 text-amber-500 inline shrink-0" /> Try this at the bottom of the page - it will auto-flip upward!
        </p>
      </div>

      {/* Example 3: Testing Area - Push to bottom */}
      <div className="h-[800px] flex items-end">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">3. Bottom Page Test</h3>
          <p className="text-sm text-slate-600 mb-2">
            This Select is near bottom - should open upward
          </p>
          <div className="max-w-xs">
            <Select
              label="Test Bottom Positioning"
              value=""
              onChange={() => {}}
              options={Array.from({ length: 10 }, (_, i) => ({
                label: `Option ${i + 1}`,
                value: `opt-${i + 1}`,
              }))}
              enableSearch
              placeholder="Open me to test positioning"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Table with Action Menus
 */
export const TableWithSmartDropdowns: React.FC = () => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const buttonRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({});

  const getButtonRef = (id: string) => {
    if (!buttonRefs.current[id]) {
      buttonRefs.current[id] = React.createRef<HTMLButtonElement>();
    }
    return buttonRefs.current[id];
  };

  const rows = Array.from({ length: 20 }, (_, i) => ({
    id: `row-${i}`,
    name: `Document ${i + 1}`,
    status: i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'Approved' : 'Effective',
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table with Smart Dropdowns</h2>
      
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    ref={getButtonRef(row.id)}
                    onClick={() => setOpenDropdownId(row.id)}
                    className="px-2 py-1 hover:bg-slate-100 rounded"
                  >
                    •••
                  </button>
                  
                  <SmartDropdown
                    isOpen={openDropdownId === row.id}
                    onClose={() => setOpenDropdownId(null)}
                    triggerRef={getButtonRef(row.id) as React.RefObject<HTMLElement>}
                    estimatedHeight={160}
                  >
                    <DropdownItem 
                      icon={<Eye />}
                      onClick={() => {
                        console.log('View', row.id);
                        setOpenDropdownId(null);
                      }}
                    >
                      View
                    </DropdownItem>
                    <DropdownItem 
                      icon={<Edit />}
                      onClick={() => {
                        console.log('Edit', row.id);
                        setOpenDropdownId(null);
                      }}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem 
                      icon={<Trash />}
                      onClick={() => {
                        console.log('Delete', row.id);
                        setOpenDropdownId(null);
                      }}
                      destructive
                    >
                      Delete
                    </DropdownItem>
                  </SmartDropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-600 mt-4">
        <Lightbulb className="h-4 w-4 text-amber-500 inline shrink-0" /> Scroll to bottom rows and click Actions - dropdowns will auto-flip upward!
      </p>
    </div>
  );
};

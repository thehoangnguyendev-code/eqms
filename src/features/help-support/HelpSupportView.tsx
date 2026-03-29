import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page/PageHeader';
import breadcrumbs from '@/components/ui/breadcrumb/breadcrumbs.config';
import { ContactSupport } from './components/ContactSupport';

export const HelpSupportView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Contact Support"
                breadcrumbItems={breadcrumbs.helpSupport(navigate)}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <ContactSupport />
            </div>
        </div>
    );
};

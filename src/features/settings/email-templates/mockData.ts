// Email Templates Mock Data

import type { EmailTemplate } from "./types";

// TODO: Replace with API call: GET /api/settings/email-templates
export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "1",
    name: "Password Reset Email",
    type: "password-reset",
    subject: "Reset Your Password - {{systemName}}",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>

        <p>Dear {{userName}},</p>

        <p>We received a request to reset your password for your {{systemName}} account.</p>

        <p>If you made this request, please click the button below to reset your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetPasswordUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>

        <p>This link will expire in 24 hours for security reasons.</p>

        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>

        <p>For security reasons, please do not share this email with anyone.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This email was sent by {{systemName}} on {{currentDate}}.<br />
          If you have any questions, please contact your system administrator.
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "systemName", "resetPasswordUrl", "logoUrl", "companyName", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "support@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-01-15",
    lastUsed: "2024-12-30",
    usageCount: 45,
    description: "Standard password reset email template with security best practices"
  },
  {
    id: "2",
    name: "User Welcome Email",
    type: "user-welcome",
    subject: "Welcome to {{systemName}} - Your Account is Ready",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <h2 style="color: #333; margin-bottom: 20px;">Welcome to {{systemName}}!</h2>

        <p>Dear {{userName}},</p>

        <p>Welcome to {{companyName}}'s Quality Management System! Your account has been successfully created and is ready to use.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Account Details:</h3>
          <p><strong>Employee Code:</strong> {{employeeCode}}</p>
          <p><strong>Role:</strong> {{userRole}}</p>
          <p><strong>Department:</strong> {{userDepartment}}</p>
          <p><strong>Email:</strong> {{userEmail}}</p>
        </div>

        <p>You can now access the system using the following link:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Access System</a>
        </div>

        <p><strong>Important:</strong> For your first login, you will need to set up your password. Please check your email for password setup instructions.</p>

        <p>If you have any questions or need assistance, please don't hesitate to contact your department manager or the IT support team.</p>

        <p>We look forward to working with you!</p>

        <p>Best regards,<br />{{companyName}} Team</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This email was sent by {{systemName}} on {{currentDate}}.<br />
          Please keep this email for your records.
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "systemName", "companyName", "employeeCode", "userRole", "userDepartment", "userEmail", "loginUrl", "logoUrl", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "hr@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-01-20",
    lastUsed: "2024-12-28",
    usageCount: 23,
    description: "Welcome email for new users with account details and access instructions"
  },
  {
    id: "3",
    name: "Document Review Notification",
    type: "document-review",
    subject: "Document Review Required: {{documentTitle}}",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <h2 style="color: #333; margin-bottom: 20px;">Document Review Request</h2>

        <p>Dear {{userName}},</p>

        <p>You have been assigned as a reviewer for the following document:</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Document Details:</h3>
          <p><strong>Title:</strong> {{documentTitle}}</p>
          <p><strong>Document Number:</strong> {{documentNumber}}</p>
          <p><strong>Version:</strong> {{documentVersion}}</p>
          <p><strong>Review Due Date:</strong> {{reviewDueDate}}</p>
        </div>

        <p>Please review the document and provide your feedback by the due date. You can access the document using the link below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{documentUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Document</a>
        </div>

        <p><strong>Review Guidelines:</strong></p>
        <ul>
          <li>Check for accuracy and completeness of content</li>
          <li>Verify compliance with regulatory requirements</li>
          <li>Ensure clarity and readability</li>
          <li>Provide constructive feedback if changes are needed</li>
        </ul>

        <p>If you have any questions or need additional information, please contact the document owner.</p>

        <p>Thank you for your attention to this important matter.</p>

        <p>Best regards,<br />{{systemName}} Team</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This is an automated notification from {{systemName}} sent on {{currentDate}}.<br />
          Document reviews are critical for maintaining quality standards.
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "documentTitle", "documentNumber", "documentVersion", "reviewDueDate", "documentUrl", "systemName", "logoUrl", "companyName", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "qa@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-02-01",
    lastUsed: "2024-12-29",
    usageCount: 156,
    description: "Notification email for document review assignments with clear instructions"
  },
  {
    id: "4",
    name: "Training Notification",
    type: "training-notification",
    subject: "Training Assignment: {{trainingTitle}}",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <h2 style="color: #333; margin-bottom: 20px;">Training Assignment</h2>

        <p>Dear {{userName}},</p>

        <p>You have been assigned the following training module:</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Training Details:</h3>
          <p><strong>Title:</strong> {{trainingTitle}}</p>
          <p><strong>Due Date:</strong> {{trainingDueDate}}</p>
          <p><strong>Department:</strong> {{userDepartment}}</p>
        </div>

        <p>This training is mandatory and must be completed by the due date. You can access the training module using the link below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{trainingUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Training</a>
        </div>

        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>This training covers essential procedures and compliance requirements</li>
          <li>You must achieve a passing score to complete the training</li>
          <li>Training records will be maintained in your profile</li>
          <li>Contact your supervisor if you need extensions or have questions</li>
        </ul>

        <p>Please complete this training promptly to ensure compliance with our quality management standards.</p>

        <p>Best regards,<br />Training Department<br />{{companyName}}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This notification was sent by {{systemName}} on {{currentDate}}.<br />
          Training completion is tracked and may affect compliance status.
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "trainingTitle", "trainingDueDate", "userDepartment", "trainingUrl", "companyName", "systemName", "logoUrl", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "training@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-01-25",
    lastUsed: "2024-12-27",
    usageCount: 89,
    description: "Training assignment notification with completion requirements"
  },
  {
    id: "5",
    name: "Audit Notification",
    type: "audit-notification",
    subject: "Audit Scheduled: {{auditTitle}}",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <h2 style="color: #333; margin-bottom: 20px;">Audit Notification</h2>

        <p>Dear {{userName}},</p>

        <p>You are required to participate in the following audit:</p>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Audit Details:</h3>
          <p><strong>Title:</strong> {{auditTitle}}</p>
          <p><strong>Date:</strong> {{auditDate}}</p>
          <p><strong>Department:</strong> {{userDepartment}}</p>
        </div>

        <p>Please prepare the necessary documentation and be available for the audit. You can view detailed audit information using the link below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{auditUrl}}" style="background-color: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Audit Details</a>
        </div>

        <p><strong>Audit Preparation Checklist:</strong></p>
        <ul>
          <li>Gather all relevant documentation</li>
          <li>Review procedures and records</li>
          <li>Prepare evidence of compliance</li>
          <li>Be available during the audit period</li>
          <li>Cooperate fully with auditors</li>
        </ul>

        <p>Your cooperation in this audit is essential for maintaining our quality management system certification.</p>

        <p>If you have any questions, please contact the Quality Assurance department.</p>

        <p>Best regards,<br />Quality Assurance Team<br />{{companyName}}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This notification was sent by {{systemName}} on {{currentDate}}.<br />
          Audit participation is mandatory for assigned personnel.
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "auditTitle", "auditDate", "userDepartment", "auditUrl", "companyName", "systemName", "logoUrl", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "audit@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-02-05",
    lastUsed: "2024-12-26",
    usageCount: 34,
    description: "Audit notification with preparation requirements and compliance importance"
  },
  {
    id: "6",
    name: "System Maintenance Notification",
    type: "system-maintenance",
    subject: "Scheduled System Maintenance - {{systemName}}",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{companyName}}" style="max-width: 200px; height: auto;" />
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin-bottom: 20px;">⚠️ System Maintenance Notice</h2>
        </div>

        <p>Dear {{userName}},</p>

        <p>{{systemName}} will undergo scheduled maintenance. During this period, the system will be temporarily unavailable.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Maintenance Schedule:</h3>
          <p><strong>Start Time:</strong> Tonight at 10:00 PM</p>
          <p><strong>End Time:</strong> Tomorrow at 2:00 AM</p>
          <p><strong>Expected Duration:</strong> 4 hours</p>
        </div>

        <p><strong>What to expect:</strong></p>
        <ul>
          <li>Temporary loss of system access</li>
          <li>Email notifications may be delayed</li>
          <li>Document uploads/downloads will be unavailable</li>
          <li>All data will be preserved and backed up</li>
        </ul>

        <p>We apologize for any inconvenience this may cause. The maintenance is necessary to ensure system reliability and security.</p>

        <p>The system will automatically be available once maintenance is complete. You will receive a notification when the system is back online.</p>

        <p>If you have urgent matters that require system access during this period, please contact the IT support team immediately.</p>

        <p>Thank you for your understanding.</p>

        <p>Best regards,<br />IT Support Team<br />{{companyName}}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #666; font-size: 12px;">
          This notification was sent by {{systemName}} on {{currentDate}}.<br />
          For urgent IT support, contact: it-support@company.com
        </p>
      </div>
    `,
    status: "Active",
    variables: ["userName", "systemName", "logoUrl", "companyName", "currentDate"],
    logoUrl: "/assets/images/logo-app/logo.png",
    logoFileName: "company-logo.png",
    copyright: "© 2007 - 2026 EQMS Corporation. All rights reserved.",
    contactEmail: "it-support@eqms.example.com",
    createdBy: "Admin Hệ Thống",
    createdDate: "2024-01-15",
    updatedBy: "Admin Hệ Thống",
    updatedDate: "2024-02-10",
    lastUsed: "2024-12-20",
    usageCount: 12,
    description: "System maintenance notification with schedule and impact information"
  }
];
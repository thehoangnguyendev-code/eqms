import React, { useRef, useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onInsertVariable?: (variable: string) => void;
}

export const CKEditorEditor: React.FC<CKEditorEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  className = "",
  onInsertVariable
}) => {
  const editorRef = useRef<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    // Configure CKEditor
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      if (editor) {
        setEditorInstance(editor);
      }
    }
  }, []);

  // Expose insert function to parent
  useEffect(() => {
    if (onInsertVariable && editorInstance) {
      // This would be called when parent wants to insert a variable
      // For now, we'll handle it in the parent component
    }
  }, [onInsertVariable, editorInstance]);

  return (
    <div className={`ckeditor-wrapper ${className}`} style={{ minHeight: '300px' }}>
      <CKEditor
        ref={editorRef}
        editor={ClassicEditor}
        data={value}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          placeholder: placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'fontSize',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'alignment',
            '|',
            'numberedList',
            'bulletedList',
            '|',
            'indent',
            'outdent',
            '|',
            'link',
            'blockQuote',
            '|',
            'insertTable',
            '|',
            'undo',
            'redo'
          ],
          fontSize: {
            options: [9, 11, 13, 'default', 17, 19, 21]
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
          }
        }}
      />
    </div>
  );
};
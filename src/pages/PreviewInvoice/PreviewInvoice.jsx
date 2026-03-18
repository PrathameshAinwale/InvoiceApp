import { useParams, useNavigate } from 'react-router-dom';
import invoice from '../../data/invoice.json';

const PreviewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = invoice.find(i => i.id === id);  // ← find by id

  if (!item) return <p>Invoice not found</p>;

  return (
    <div className="preview-page">
        preview page
    </div>
  );
};

export default PreviewInvoice;
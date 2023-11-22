import React, { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import InvoiceModal from "../components/InvoiceModal";
import { useNavigate } from "react-router-dom";
import { useInvoiceListData } from "../redux/hooks";
import { useDispatch } from "react-redux";
import { deleteInvoice, updateInvoice } from "../redux/invoicesSlice";
import { BiSolidPencil, BiTrash } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";

const InvoiceList = () => {
  const { invoiceList, getOneInvoice } = useInvoiceListData();
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [copyId, setCopyId] = useState("");
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditDueDate, setBulkEditDueDate] = useState("");
  const [editableField, setEditableField] = useState(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCopyClick = () => {
    const invoice = getOneInvoice(copyId);
    if (!invoice) {
      alert("Please enter a valid invoice id.");
    } else {
      navigate(`/create/${copyId}`);
    }
  };

  const handleBulkClick = () => {
    setShowBulkEdit((prevShowBulkEdit) => !prevShowBulkEdit);
    setSelectedInvoices([]);
    setIsBulkEditMode((prevIsBulkEditMode) => !prevIsBulkEditMode);
  };

  const handleInvoiceSelect = (invoiceId) => {
    setSelectedInvoices((prevSelected) => {
      if (prevSelected.includes(invoiceId)) {
        return prevSelected.filter((id) => id !== invoiceId);
      } else {
        return [...prevSelected, invoiceId];
      }
    });
  };

  const handleBulkEditFieldChange = (invoiceId, fieldName, value) => {
    const updatedInvoiceList = invoiceList.map((invoice) => {
      if (invoice.id === invoiceId) {
        return { ...invoice, [fieldName]: value };
      }
      return invoice;
    });
  };

  const handleEditFieldClick = (field) => {
    setEditableField(field);
  };

  const handleBulkEditSave = () => {
    selectedInvoices.forEach((invoiceId) => {
      dispatch(
        updateInvoice({ id: invoiceId, changes: { dueDate: bulkEditDueDate } })
      );
    });

    setShowBulkEdit(false);
    setSelectedInvoices([]);
    setBulkEditDueDate("");
    setIsBulkEditMode(false);
  };

  const handleCancelBulkEdit = () => {
    setShowBulkEdit(false);
    setSelectedInvoices([]);
    setBulkEditDueDate("");
    setIsBulkEditMode(false);
  };

  return (
    <Row>
      <Col className="mx-auto" xs={12} md={8} lg={9}>
        <h3 className="fw-bold pb-2 pb-md-4 text-center">Swipe Assignment</h3>
        <Card className="d-flex p-3 p-md-4 my-3 my-md-4 ">
          {invoiceList.length === 0 ? (
            <div className="d-flex flex-column align-items-center">
              <h3 className="fw-bold pb-2 pb-md-4">No invoices present</h3>
              <Link to="/create">
                <Button variant="primary">Create Invoice</Button>
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <h3 className="fw-bold pb-2 pb-md-4">Invoice List</h3>
                <Link to="/create">
                  <Button variant="primary mb-2 mb-md-4">Create Invoice</Button>
                </Link>

                <div className="d-flex gap-2">
                  {!isBulkEditMode && (
                    <div>
                      <Button
                        variant="dark mb-2 mb-md-4"
                        onClick={handleCopyClick}
                      >
                        Copy Invoice
                      </Button>

                      <input
                        type="text"
                        value={copyId}
                        onChange={(e) => setCopyId(e.target.value)}
                        placeholder="Enter Invoice ID to copy"
                        className="bg-white border"
                        style={{
                          height: "50px",
                          marginLeft: "10px",
                        }}
                      />
                    </div>
                  )}

                  <Button
                    variant="success mb-2 mb-md-4"
                    onClick={handleBulkClick}
                  >
                    {isBulkEditMode ? "Save Changes" : "Bulk Edit"}
                  </Button>

                  {isBulkEditMode && (
                    <Button
                      variant="danger mb-2 mb-md-4"
                      onClick={handleCancelBulkEdit}
                    >
                      Cancel Bulk Edit
                    </Button>
                  )}
                </div>
              </div>

              {showBulkEdit && (
          <div>
            <h4>Select Invoices for Bulk Edit</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Invoice No.</th>
                    <th>Bill To</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleInvoiceSelect(invoice.id)}
                        />
                      </td>
                      <td>{invoice.invoiceNumber}</td>
                      <td className="fw-normal">
                        {selectedInvoices.includes(invoice.id) ? (
                          <input
                            type="text"
                            value={invoice.billTo}
                            onChange={(e) => handleBulkEditFieldChange(invoice.id, 'billTo', e.target.value)}
                          />
                        ) : (
                          <span>{invoice.billTo}</span>
                        )}
                      </td>
                      <td className="fw-normal">{invoice.dateOfIssue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Bill To</th>
                      <th>Due Date</th>
                      <th>Total Amt.</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceList.map((invoice) => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        navigate={navigate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

const InvoiceRow = ({ invoice, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteClick = (invoiceId) => {
    dispatch(deleteInvoice(invoiceId));
  };

  const handleEditClick = () => {
    navigate(`/edit/${invoice.id}`);
  };

  const openModal = (event) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <tr>
      <td>{invoice.invoiceNumber}</td>
      <td className="fw-normal">{invoice.billTo}</td>
      <td className="fw-normal">{invoice.dateOfIssue}</td>
      <td className="fw-normal">
        {invoice.currency}
        {invoice.total}
      </td>
      <td style={{ width: "5%" }}>
        <Button variant="outline-primary" onClick={handleEditClick}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BiSolidPencil />
          </div>
        </Button>
      </td>
      <td style={{ width: "5%" }}>
        <Button variant="danger" onClick={() => handleDeleteClick(invoice.id)}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BiTrash />
          </div>
        </Button>
      </td>
      <td style={{ width: "5%" }}>
        <Button variant="secondary" onClick={openModal}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BsEyeFill />
          </div>
        </Button>
      </td>
      <InvoiceModal
        showModal={isOpen}
        closeModal={closeModal}
        info={{
          isOpen,
          id: invoice.id,
          currency: invoice.currency,
          currentDate: invoice.currentDate,
          invoiceNumber: invoice.invoiceNumber,
          dateOfIssue: invoice.dateOfIssue,
          billTo: invoice.billTo,
          billToEmail: invoice.billToEmail,
          billToAddress: invoice.billToAddress,
          billFrom: invoice.billFrom,
          billFromEmail: invoice.billFromEmail,
          billFromAddress: invoice.billFromAddress,
          notes: invoice.notes,
          total: invoice.total,
          subTotal: invoice.subTotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          discountRate: invoice.discountRate,
          discountAmount: invoice.discountAmount,
        }}
        items={invoice.items}
        currency={invoice.currency}
        subTotal={invoice.subTotal}
        taxAmount={invoice.taxAmount}
        discountAmount={invoice.discountAmount}
        total={invoice.total}
      />
    </tr>
  );
};

export default InvoiceList;

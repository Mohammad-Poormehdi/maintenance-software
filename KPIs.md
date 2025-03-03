# Recommended KPIs for Maintenance & Inventory Management Analytics

Based on your database schema, here are strategic KPIs organized by business area with recommended visualization methods and calculation approaches.

## Inventory Management KPIs

### 1. Stock Level Compliance
- **Visualization:** Gauge chart or heatmap
- **Calculation:** (Number of parts above minimum stock / Total number of parts) × 100%
- **Description:** Shows percentage of inventory items meeting minimum stock requirements

### 2. Inventory Turnover Rate
- **Visualization:** Line chart (trend over time)
- **Calculation:** Total parts consumed in maintenance / Average inventory level
- **Description:** Measures how frequently inventory is used and replenished

### 3. Stock-out Frequency
- **Visualization:** Bar chart (by part category)
- **Calculation:** Count of instances where currentStock = 0 for any part
- **Description:** Highlights critical inventory failures

### 4. Top 10 Most Used Parts
- **Visualization:** Horizontal bar chart
- **Calculation:** Count parts from MaintenanceEvent grouped by partId
- **Description:** Identifies most critical inventory items

## Supplier Performance KPIs

### 5. Supplier Lead Time Performance
- **Visualization:** Box plot or violin plot
- **Calculation:** Actual delivery time (Order.deliveryDate - Order.orderDate) vs. promised lead time (SupplierPart.leadTime)
- **Description:** Measures supplier reliability in meeting delivery promises

### 6. Supplier Price Competitiveness
- **Visualization:** Radar chart
- **Calculation:** Compare SupplierPart.price across suppliers for common parts
- **Description:** Identifies cost-effective supplier relationships

### 7. Order Fulfillment Rate
- **Visualization:** Donut chart
- **Calculation:** (Number of DELIVERED orders / Total orders) × 100%
- **Description:** Tracks successful order completion

## Equipment Reliability KPIs

### 8. Equipment Health Distribution
- **Visualization:** Pie chart
- **Calculation:** Count of equipment by EquipmentStatus category
- **Description:** Shows overall fleet health at a glance

### 9. Mean Time Between Failures (MTBF)
- **Visualization:** Line chart (by equipment)
- **Calculation:** Average time between MaintenanceEvent records with eventType = BREAKDOWN for each equipment
- **Description:** Measures reliability of equipment

### 10. Equipment Downtime
- **Visualization:** Stacked bar chart
- **Calculation:** Sum of time difference between MaintenanceEvent.scheduledDate and MaintenanceEvent.completedDate grouped by equipment
- **Description:** Shows lost productivity from equipment maintenance

## Maintenance Efficiency KPIs

### 11. Planned vs. Unplanned Maintenance Ratio
- **Visualization:** Stacked area chart
- **Calculation:** Compare count of MaintenanceEvent records with eventType = SCHEDULED_MAINTENANCE vs. eventType = BREAKDOWN over time
- **Description:** Indicates effectiveness of preventative maintenance program

### 12. Maintenance Compliance
- **Visualization:** Gauge chart
- **Calculation:** (Number of completed scheduled maintenance events / Total scheduled maintenance events) × 100%
- **Description:** Shows adherence to maintenance schedules

### 13. Maintenance Backlog Trend
- **Visualization:** Line chart
- **Calculation:** Count of maintenance events where scheduledDate < current date and completedDate = null
- **Description:** Tracks accumulation of delayed maintenance

## Cost Management KPIs

### 14. Part Cost Trend
- **Visualization:** Line chart
- **Calculation:** Average OrderItem.unitPrice for top parts over time
- **Description:** Monitors price inflation and helps forecast budgets

### 15. Maintenance Cost by Equipment
- **Visualization:** Treemap
- **Calculation:** Sum of (OrderItem.quantity * OrderItem.unitPrice) for parts used in maintenance events, grouped by equipment
- **Description:** Identifies equipment with highest maintenance costs

### 16. Inventory Value Distribution
- **Visualization:** Pie chart or treemap
- **Calculation:** Sum of (Part.currentStock * latest OrderItem.unitPrice) grouped by part category
- **Description:** Shows capital allocation across inventory categories

## Dashboard Implementation Recommendations

### Executive Dashboard
- Equipment Health Distribution (Pie)
- Inventory Compliance (Gauge)
- Planned vs. Unplanned Maintenance (Area)
- Top Cost Drivers (Pareto)

### Inventory Manager Dashboard
- Stock Level Compliance by Category (Heatmap)
- Inventory Turnover Trend (Line)
- Stock-out Alerts (List)
- Reorder Recommendations (Table)

### Maintenance Manager Dashboard
- Equipment Status Overview (Status Cards)
- Upcoming Scheduled Maintenance (Calendar)
- MTBF by Equipment (Bar)
- Maintenance Backlog Trend (Line)

These KPIs will provide comprehensive visibility into your maintenance operations, inventory health, and supplier performance, helping you optimize processes and reduce costs
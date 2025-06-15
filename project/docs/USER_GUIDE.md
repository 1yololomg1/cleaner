# POLISH User Guide

## Complete Guide to Petrophysical Data Processing

### Version 1.0.0
### Last Updated: December 2024

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding Quality Scores](#understanding-quality-scores)
3. [Processing Algorithms Guide](#processing-algorithms-guide)
4. [Troubleshooting Common Issues](#troubleshooting-common-issues)
5. [File Formats & Export Options](#file-formats--export-options)
6. [Pricing Structure](#pricing-structure)
7. [Best Practices](#best-practices)
8. [FAQ](#frequently-asked-questions)

---

## Getting Started

### What is POLISH?

POLISH (Petrophysical Operations for Log Intelligence, Smoothing and Harmonization) is a professional-grade platform for preprocessing petrophysical data. It transforms raw LAS files into pristine, analysis-ready datasets using advanced signal processing algorithms.

### Quick Start Guide

#### Step 1: Upload Your LAS Files
1. **Drag and Drop**: Simply drag your LAS files into the upload zone
2. **Browse Files**: Click "Browse Files" to select files from your computer
3. **Supported Formats**: LAS v1.2, v2.0, and v3.0 (up to 100MB per file)
4. **Security**: All processing happens locally in your browser - no uploads required

#### Step 2: Review File Information
- **Well Details**: Company, well name, field, and location information
- **Depth Range**: Start/stop depths and sampling interval
- **Curve Inventory**: Complete list of available log curves with units
- **Quality Preview**: Initial assessment of data completeness

#### Step 3: Configure Processing Options
- **Denoising**: Reduce noise while preserving geological features
- **Spike Detection**: Identify and remove data outliers
- **Physical Validation**: Check values against industry standards
- **Mnemonic Standardization**: Convert to API or CWLS standards

#### Step 4: Execute Processing
1. Click "Execute Processing Pipeline"
2. Monitor progress in real-time
3. Review quality control results
4. Examine processing recommendations

#### Step 5: Export Results
- **Free Features**: All processing, visualization, and QC analysis
- **Premium Export**: Cleaned LAS files with processing certificates ($400)
- **Format Conversion**: CSV, Excel, JSON, WITSML, SEG-Y (dollar-based pricing)

---

## Understanding Quality Scores

### Overall Quality Assessment

POLISH evaluates data quality using a comprehensive scoring system from 0-100 points:

#### Grade A (90-100 Points) - Excellent Quality ✅
- **Data Completeness**: >95% non-null values
- **Noise Level**: <5% signal degradation
- **Spikes**: Minimal outliers detected
- **Physical Validation**: All curves within expected ranges
- **Recommendation**: Data is production-ready for advanced analysis

#### Grade B (75-89 Points) - Good Quality ✅
- **Data Completeness**: 85-95% non-null values
- **Noise Level**: 5-15% signal degradation
- **Spikes**: Few outliers, easily correctable
- **Physical Validation**: Minor range violations
- **Recommendation**: Light processing recommended, suitable for most analyses

#### Grade C (60-74 Points) - Acceptable Quality ⚠️
- **Data Completeness**: 70-85% non-null values
- **Noise Level**: 15-30% signal degradation
- **Spikes**: Moderate outliers present
- **Physical Validation**: Some range violations
- **Recommendation**: Processing required before analysis

#### Grade D (50-59 Points) - Poor Quality ⚠️
- **Data Completeness**: 50-70% non-null values
- **Noise Level**: 30-50% signal degradation
- **Spikes**: Significant outliers present
- **Physical Validation**: Multiple range violations
- **Recommendation**: Extensive processing needed

#### Grade F (0-49 Points) - Unacceptable Quality ❌
- **Data Completeness**: <50% non-null values
- **Noise Level**: >50% signal degradation
- **Spikes**: Severe outlier contamination
- **Physical Validation**: Major range violations
- **Recommendation**: Consider re-logging or data source review

### Quality Factors Explained

#### Data Completeness
- **Calculation**: (Total Points - Null Points) / Total Points × 100
- **Impact**: Missing data reduces analysis reliability
- **Typical Causes**: Tool malfunctions, washouts, poor hole conditions

#### Noise Level
- **Measurement**: Signal-to-noise ratio assessment
- **Impact**: Affects interpretation accuracy
- **Typical Causes**: Electronic interference, vibration, poor tool contact

#### Spike Detection
- **Method**: Statistical outlier identification
- **Impact**: False anomalies can mislead interpretation
- **Typical Causes**: Tool sticking, electrical interference, data transmission errors

#### Physical Validation
- **Standards**: Industry-accepted ranges for each curve type
- **Examples**: 
  - Gamma Ray: 0-300 API units
  - Neutron Porosity: -0.15 to 1.0 v/v
  - Bulk Density: 1.0-3.5 g/cm³
  - Resistivity: 0.1-10,000 ohm-m

---

## Processing Algorithms Guide

### 1. Savitzky-Golay Denoising

**Purpose**: Advanced smoothing that preserves signal features while reducing noise.

**How it Works**:
- Fits polynomial curves to local data windows
- Preserves peak shapes and geological features
- Reduces random noise without over-smoothing

**Parameters**:
- **Window Size** (5-21 points): Larger values = more smoothing
- **Polynomial Order** (2-6): Higher values preserve features better
- **Strength** (0-100%): Blending factor with original data

**Best Used For**:
- Gamma ray curves with electronic noise
- Resistivity logs with tool vibration
- Porosity curves with minor fluctuations

**Recommendations**:
- Start with window size 11, polynomial order 3
- Increase window size for very noisy data
- Use strength 50-70% to maintain geological character

### 2. Hampel Spike Detection

**Purpose**: Robust outlier detection using statistical methods.

**How it Works**:
- Calculates local median and Median Absolute Deviation (MAD)
- Identifies points exceeding threshold × MAD
- Replaces outliers using shape-preserving interpolation

**Parameters**:
- **Threshold** (1.0-5.0): Lower values = more sensitive detection
- **Window Size** (3-15 points): Analysis window for local statistics
- **Replacement Method**: PCHIP interpolation (recommended)

**Best Used For**:
- Tool sticking artifacts
- Electrical interference spikes
- Data transmission errors

**Recommendations**:
- Use threshold 2.5-3.0 for balanced detection
- Smaller windows for localized spikes
- PCHIP replacement preserves curve shape

### 3. Physical Range Validation

**Purpose**: Validates measurements against known petrophysical ranges.

**Industry Standards**:
- **Gamma Ray**: 0-300 API units (typical sedimentary rocks)
- **Neutron Porosity**: -0.15 to 1.0 v/v (includes gas effects)
- **Bulk Density**: 1.0-3.5 g/cm³ (fluid to dense minerals)
- **True Resistivity**: 0.1-10,000 ohm-m (conductive to resistive)
- **Caliper**: 4-20 inches (typical borehole sizes)
- **Spontaneous Potential**: -200 to +50 mV

**Validation Process**:
1. Compare each measurement to expected range
2. Flag values outside physical limits
3. Check for cross-curve consistency
4. Generate validation warnings

### 4. Mnemonic Standardization

**Purpose**: Converts curve names to industry standards for compatibility.

**Supported Standards**:
- **API RP 33**: American Petroleum Institute standard
- **CWLS**: Canadian Well Logging Society standard
- **Custom Mapping**: User-defined conversions

**Common Mappings**:
- GR, GAMMA, GAMR → GR (Gamma Ray)
- NPHI, TNPH, NEUT → NPHI (Neutron Porosity)
- RHOB, DENS, RHOZ → RHOB (Bulk Density)
- RT, RES, RILD → RT (True Resistivity)

---

## Pricing Structure

### Premium LAS Export

#### Standard Pricing
- **Single LAS File + Report**: $400
- **Includes**: Cleaned LAS file, processing certificate, comprehensive QC report, audit trail

#### Volume Pricing
- **50+ Files**: $350 per file (12.5% discount)
- **100+ Files**: $300 per file (25% discount)
- **Enterprise Volumes**: Custom pricing available

#### What's Included
- ✅ Fully processed and cleaned LAS file
- ✅ Processing certificate with unique ID and digital signature
- ✅ Comprehensive quality control metrics and validation report
- ✅ Standardized mnemonics and units (API/CWLS compliant)
- ✅ Complete processing audit trail and parameter documentation
- ✅ Professional PDF report with visualizations and recommendations
- ✅ 30-day money-back guarantee

### Format Conversion Pricing

#### Standard Formats
- **CSV**: $20 per file
- **Excel (XLSX)**: $30 per file
- **JSON**: $20 per file
- **ASCII**: $20 per file

#### Industry Formats
- **WITSML**: $50 per file
- **SEG-Y**: $80 per file

#### Report-Only Option
- **PDF QC Report**: $425 (without LAS file)
- **Includes**: Comprehensive analysis, visualizations, recommendations

### Payment Options
- **Credit/Debit Cards**: Visa, MasterCard, American Express
- **PayPal**: Secure online payments
- **Enterprise**: Invoice billing available for large volumes
- **Security**: PCI DSS compliant, 256-bit SSL encryption

---

## File Formats & Export Options

### Input Formats

#### LAS (Log ASCII Standard)
- **Versions Supported**: 1.2, 2.0, 3.0
- **File Size Limit**: 100MB (client-side processing)
- **Features**: Full header preservation, all curve types
- **Encoding**: ASCII text format

### Export Formats

#### Premium LAS Export ($400)
- **Features**: 
  - Fully processed and cleaned data
  - Processing certificate with unique ID
  - Quality control metrics
  - Standardized mnemonics
  - Processing audit trail
- **Format**: LAS 2.0 compliant
- **Includes**: PDF processing report

#### Format Conversion (Dollar-Based Pricing)

##### CSV ($20)
- **Features**: Comma-separated values, customizable delimiters
- **Best For**: Spreadsheet analysis, data import
- **Options**: Header inclusion, custom separators
- **Limitations**: No metadata preservation

##### Excel/XLSX ($30)
- **Features**: Multiple sheets, formatting, charts
- **Best For**: Reporting, presentations, analysis
- **Options**: Separate sheets per curve type
- **Includes**: Summary statistics, quality metrics

##### JSON ($20)
- **Features**: Structured data, metadata preservation
- **Best For**: Web applications, API integration
- **Structure**: Hierarchical with header, curves, data
- **Encoding**: UTF-8 with proper escaping

##### ASCII ($20)
- **Features**: Custom formatted text output
- **Best For**: Legacy system compatibility
- **Options**: Configurable column widths, headers
- **Format**: Fixed-width or delimited

##### WITSML ($50)
- **Features**: Industry XML standard, full metadata
- **Best For**: Industry data exchange, compliance
- **Version**: WITSML 2.0 compliant
- **Includes**: Complete well information

##### SEG-Y ($80)
- **Features**: Seismic integration, trace headers
- **Best For**: Seismic-well tie, integrated interpretation
- **Format**: SEG-Y Revision 2
- **Limitations**: Compatible curve types only

---

## Best Practices

### Data Preparation

#### Before Upload
1. **Verify File Integrity**: Check LAS file structure
2. **Review Curve Inventory**: Ensure all required curves present
3. **Check Units**: Verify consistent unit systems
4. **Backup Original**: Keep unprocessed copies

#### File Organization
1. **Naming Convention**: Use descriptive, consistent names
2. **Version Control**: Track processing versions
3. **Documentation**: Maintain processing logs
4. **Quality Records**: Keep QC reports

### Processing Workflow

#### Recommended Sequence
1. **Initial Assessment**: Review raw data quality
2. **Physical Validation**: Check for range violations
3. **Spike Detection**: Remove obvious outliers
4. **Denoising**: Apply appropriate smoothing
5. **Standardization**: Convert mnemonics
6. **Final QC**: Verify processing results

#### Parameter Selection
1. **Start Conservative**: Use default parameters initially
2. **Iterative Approach**: Adjust based on results
3. **Visual Verification**: Check before/after plots
4. **Document Changes**: Record parameter modifications

### Quality Control

#### Validation Checklist
- [ ] Data completeness >90%
- [ ] Noise level <20%
- [ ] Spikes removed appropriately
- [ ] Physical ranges validated
- [ ] Mnemonics standardized
- [ ] Processing documented

#### Red Flags
- Sudden quality score decrease after processing
- Over-smoothed geological features
- Excessive spike removal
- Unrealistic physical values
- Loss of important data

### Export Strategy

#### Format Selection
- **LAS**: For industry standard compatibility
- **CSV**: For spreadsheet analysis
- **Excel**: For reporting and presentations
- **JSON**: For web applications
- **WITSML**: For industry data exchange
- **SEG-Y**: For seismic integration

#### Documentation
- Include processing certificates
- Maintain audit trails
- Document parameter choices
- Record quality improvements

---

## Frequently Asked Questions

### General Questions

**Q: Is my data secure when using POLISH?**
A: Yes, all processing happens locally in your browser. Files are never uploaded to servers during processing, ensuring complete data security and confidentiality.

**Q: What file sizes can POLISH handle?**
A: Client-side processing supports files up to 100MB. For larger files, server-side processing options are available for premium users.

**Q: Do I need to install any software?**
A: No, POLISH runs entirely in your web browser. No downloads or installations required.

### Pricing Questions

**Q: Why does premium export cost $400?**
A: Premium exports include comprehensive processing certificates, quality reports, audit trails, and professional documentation that add significant value for regulatory compliance and professional use.

**Q: Are there volume discounts available?**
A: Yes, we offer 12.5% discount for 50+ files ($350 each) and 25% discount for 100+ files ($300 each). Enterprise pricing is available for larger volumes.

**Q: What payment methods do you accept?**
A: We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can arrange invoice billing.

**Q: Is there a money-back guarantee?**
A: Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the results, contact support for a full refund.

### Processing Questions

**Q: How do I choose the right processing parameters?**
A: Start with default settings, then adjust based on your data characteristics. Use the help system for parameter guidance and visual feedback to optimize results.

**Q: Can I undo processing steps?**
A: Each processing run creates a new version. You can always return to the original file by re-uploading it.

**Q: Why did my quality score decrease after processing?**
A: This may indicate over-processing or inappropriate parameters. Try reducing processing intensity or using different algorithms.

### Export Questions

**Q: What's included in the premium export?**
A: Premium exports include the cleaned LAS file, processing certificate with unique ID, comprehensive QC report, standardized mnemonics, processing audit trail, and professional PDF documentation.

**Q: How much do format conversions cost?**
A: Conversion pricing ranges from $20 (CSV, JSON, ASCII) to $80 (SEG-Y), with Excel at $30 and WITSML at $50 per file.

**Q: Can I get just the report without the LAS file?**
A: Yes, PDF QC reports are available for $425 without the cleaned LAS file.

### Technical Questions

**Q: Which browsers are supported?**
A: POLISH works best with modern browsers: Chrome, Firefox, Safari, and Edge. JavaScript must be enabled.

**Q: What if I encounter an error?**
A: Check the troubleshooting section first. If issues persist, contact support with error details and file information.

**Q: How accurate are the quality assessments?**
A: Quality scores are based on industry-standard metrics and extensive testing. They provide reliable indicators of data fitness for analysis.

---

## Support and Contact

### Getting Help
- **Help System**: Click the Help button in the application
- **Documentation**: Comprehensive guides and tutorials
- **Video Tutorials**: Step-by-step processing guides
- **Community Forum**: User discussions and tips

### Technical Support
- **Email**: support@polish-petro.com
- **Response Time**: 24 hours for technical issues
- **Priority Support**: Available for premium users
- **Remote Assistance**: Screen sharing for complex issues

### Sales and Enterprise
- **Volume Pricing**: Contact sales for 100+ file discounts
- **Enterprise Solutions**: Custom development available
- **Training**: On-site and remote training programs
- **Consulting**: Petrophysical data analysis services

### Feature Requests
- **Feedback Portal**: Submit enhancement requests
- **User Voting**: Vote on proposed features
- **Beta Testing**: Early access to new features
- **Custom Development**: Enterprise solutions available

---

**Document Version**: 1.0.0  
**Last Updated**: December 7, 2024  
**Next Review**: March 7, 2025
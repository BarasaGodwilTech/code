// Savings and Targets Management with Payment Integration
class SavingsManager {
    constructor() {
        this.savingsGoals = JSON.parse(localStorage.getItem('savingsGoals')) || []
        this.currentGoalData = null
        this.init()
    }

    init() {
        this.setupEventListeners()
        this.renderGoals()
        this.updateDashboard()
        this.setupPaymentModal()
    }

    setupEventListeners() {
        const form = document.getElementById('savingsForm')
        if (form) {
            form.addEventListener('submit', (e) => this.createGoal(e))
        }
    }

    setupPaymentModal() {
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(opt => 
                    opt.classList.remove('selected')
                )
                option.classList.add('selected')
                
                const method = option.getAttribute('data-method')
                this.showPaymentInstructions(method)
            })
        })

        // Confirm payment
        document.getElementById('confirmPayment')?.addEventListener('click', () => {
            this.processPayment()
        })

        // Close modal
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.hidePaymentModal()
        })

        // Close modal when clicking outside
        document.getElementById('paymentModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') {
                this.hidePaymentModal()
            }
        })
    }

    createGoal(e) {
        e.preventDefault()
        
        const formData = new FormData(e.target)
        const currentAmount = parseInt(formData.get('currentAmount'))
        
        if (currentAmount > 0) {
            // Store goal data and show payment modal
            this.currentGoalData = {
                projectName: formData.get('projectName'),
                targetAmount: parseInt(formData.get('targetAmount')),
                currentAmount: currentAmount,
                targetDate: formData.get('targetDate'),
                serviceType: formData.get('serviceType'),
                createdAt: new Date().toISOString(),
                completed: false,
                isAdditional: false
            }
            
            this.showPaymentModal()
        } else {
            // Create goal without payment
            this.saveGoal({
                projectName: formData.get('projectName'),
                targetAmount: parseInt(formData.get('targetAmount')),
                currentAmount: 0,
                targetDate: formData.get('targetDate'),
                serviceType: formData.get('serviceType'),
                createdAt: new Date().toISOString(),
                completed: false
            })
            
            e.target.reset()
            this.showMessage('Savings goal created successfully!', 'success')
        }
    }

    showPaymentModal() {
        if (!this.currentGoalData) return

        const modal = document.getElementById('paymentModal')
        document.getElementById('paymentProjectName').textContent = this.currentGoalData.projectName
        document.getElementById('paymentAmount').textContent = this.formatNumber(this.currentGoalData.currentAmount)
        document.getElementById('paymentService').textContent = this.getServiceName(this.currentGoalData.serviceType)
        
        modal.style.display = 'flex'
        
        // Reset payment form
        document.querySelectorAll('.payment-option').forEach(opt => 
            opt.classList.remove('selected')
        )
        document.getElementById('paymentInstructions').style.display = 'none'
        document.getElementById('transactionId').value = ''
    }

    hidePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none'
        this.currentGoalData = null
    }

    showPaymentInstructions(method) {
        const instructions = document.getElementById('paymentInstructions')
        const instructionsText = document.getElementById('instructionsText')
        
        const methodInstructions = {
            mtn: `Send UGX ${this.formatNumber(this.currentGoalData.currentAmount)} to MTN Mobile Money number 0783 123 456. Use your project name as reference.`,
            airtel: `Send UGX ${this.formatNumber(this.currentGoalData.currentAmount)} to Airtel Money number 0756 123 456. Use your project name as reference.`,
            bank: `Transfer UGX ${this.formatNumber(this.currentGoalData.currentAmount)} to:\nBank: Centenary Bank\nAccount: 3100045678\nName: Chase x Records\nUse your project name as reference.`,
            card: `You will be redirected to our secure payment gateway to complete your card payment of UGX ${this.formatNumber(this.currentGoalData.currentAmount)}.`
        }
        
        instructionsText.textContent = methodInstructions[method] || 'Please complete the payment using your selected method.'
        instructions.style.display = 'block'
    }

    processPayment() {
        const transactionId = document.getElementById('transactionId').value.trim()
        
        if (!transactionId) {
            this.showMessage('Please enter a transaction ID/reference', 'error')
            return
        }

        // Show processing state
        const confirmBtn = document.getElementById('confirmPayment')
        const originalText = confirmBtn.textContent
        confirmBtn.innerHTML = '<div class="spinner"></div> Processing...'
        confirmBtn.disabled = true

        // Simulate payment processing
        setTimeout(() => {
            if (this.currentGoalData.isAdditional) {
                this.processAdditionalPayment(transactionId)
            } else {
                // Create the goal with the payment
                this.saveGoal({
                    ...this.currentGoalData,
                    transactionId: transactionId,
                    paymentDate: new Date().toISOString()
                })
            }
            
            // Show success message
            this.showPaymentSuccess()
            
        }, 2000)
    }

    showPaymentSuccess() {
        const modalBody = document.querySelector('.modal-body')
        modalBody.innerHTML = `
            <div class="payment-success">
                <i class="fas fa-check-circle"></i>
                <h4>Payment Successful!</h4>
                <p>Your payment of UGX ${this.formatNumber(this.currentGoalData.currentAmount)} has been received${this.currentGoalData.isAdditional ? ' and added to your savings goal' : ' and your savings goal has been created'}.</p>
                <button class="btn btn-primary" onclick="savingsManager.completePaymentProcess()">Continue</button>
            </div>
        `
    }

    completePaymentProcess() {
        this.hidePaymentModal()
        document.getElementById('savingsForm').reset()
    }

    saveGoal(goalData) {
        const goal = {
            id: Date.now().toString(),
            ...goalData
        }

        this.savingsGoals.push(goal)
        this.saveToLocalStorage()
        this.renderGoals()
        this.updateDashboard()
        this.showMessage('Savings goal created successfully!', 'success')
    }

    updateGoal(goalId, updates) {
        const goalIndex = this.savingsGoals.findIndex(g => g.id === goalId)
        if (goalIndex !== -1) {
            this.savingsGoals[goalIndex] = { ...this.savingsGoals[goalIndex], ...updates }
            this.saveToLocalStorage()
            this.renderGoals()
            this.updateDashboard()
        }
    }

    deleteGoal(goalId) {
        this.savingsGoals = this.savingsGoals.filter(g => g.id !== goalId)
        this.saveToLocalStorage()
        this.renderGoals()
        this.updateDashboard()
        this.showMessage('Goal deleted successfully!', 'success')
    }

    addSavings(goalId, amount) {
        if (amount > 0) {
            // Show payment modal for additional savings
            const goal = this.savingsGoals.find(g => g.id === goalId)
            this.currentGoalData = {
                projectName: goal.projectName,
                targetAmount: goal.targetAmount,
                currentAmount: amount,
                serviceType: goal.serviceType,
                goalId: goalId,
                isAdditional: true
            }
            
            this.showPaymentModal()
        }
    }

    processAdditionalPayment(transactionId) {
        const goal = this.savingsGoals.find(g => g.id === this.currentGoalData.goalId)
        if (goal) {
            const newAmount = goal.currentAmount + this.currentGoalData.currentAmount
            const completed = newAmount >= goal.targetAmount
            
            this.updateGoal(this.currentGoalData.goalId, {
                currentAmount: newAmount,
                completed: completed,
                lastPaymentDate: new Date().toISOString(),
                lastPaymentAmount: this.currentGoalData.currentAmount,
                lastTransactionId: transactionId
            })

            if (completed) {
                this.showMessage(`Congratulations! You've reached your savings goal for "${goal.projectName}"`, 'success')
            }
        }
    }

    showAddSavingsModal(goalId) {
        const amount = prompt('Enter amount to add (UGX):')
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
            this.addSavings(goalId, parseInt(amount))
        } else if (amount) {
            this.showMessage('Please enter a valid amount greater than 0', 'error')
        }
    }

    calculateDaysLeft(targetDate) {
        const today = new Date()
        const target = new Date(targetDate)
        const diffTime = target - today
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    getServiceName(serviceType) {
        const services = {
            'production': 'Music Production',
            'mixing': 'Mixing & Mastering',
            'vocal': 'Vocal Production',
            'songwriting': 'Songwriting',
            'other': 'Other'
        }
        return services[serviceType] || serviceType
    }

    renderGoals() {
        const goalsList = document.getElementById('goalsList')
        if (!goalsList) return

        if (this.savingsGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="no-goals">
                    <p>No savings goals yet. Create your first goal above!</p>
                </div>
            `
            return
        }

        goalsList.innerHTML = this.savingsGoals.map(goal => this.createGoalCard(goal)).join('')
    }

    createGoalCard(goal) {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        const daysLeft = this.calculateDaysLeft(goal.targetDate)
        const progressClass = progress >= 100 ? 'completed' : progress >= 75 ? 'almost-there' : 'in-progress'
        
        return `
            <div class="goal-card ${progressClass}">
                <div class="goal-header">
                    <h4>${goal.projectName}</h4>
                    <span class="service-badge">${this.getServiceName(goal.serviceType)}</span>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>UGX ${this.formatNumber(goal.currentAmount)} / UGX ${this.formatNumber(goal.targetAmount)}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                </div>

                <div class="goal-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Target: ${new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Target date passed'}</span>
                    </div>
                    ${goal.paymentDate ? `
                    <div class="detail-item">
                        <i class="fas fa-receipt"></i>
                        <span>Initial payment: ${new Date(goal.paymentDate).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                    ${goal.lastPaymentDate ? `
                    <div class="detail-item">
                        <i class="fas fa-history"></i>
                        <span>Last payment: ${new Date(goal.lastPaymentDate).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="goal-actions">
                    <button class="btn btn-secondary btn-sm" onclick="savingsManager.showAddSavingsModal('${goal.id}')">
                        <i class="fas fa-plus"></i> Add Savings
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="savingsManager.deleteGoal('${goal.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>

                ${progress >= 100 ? `
                    <div class="completion-badge">
                        <i class="fas fa-trophy"></i> Goal Achieved!
                    </div>
                ` : ''}
            </div>
        `
    }

    updateDashboard() {
        const totalSaved = this.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
        const activeGoals = this.savingsGoals.filter(goal => !goal.completed).length
        
        // Update dashboard stats
        const totalSavedElement = document.querySelector('.savings-stats .stat-card:nth-child(1) .amount')
        const activeGoalsElement = document.querySelector('.savings-stats .stat-card:nth-child(2) .amount')
        const nextTargetElement = document.querySelector('.savings-stats .stat-card:nth-child(3) .amount')

        if (totalSavedElement) totalSavedElement.textContent = `UGX ${this.formatNumber(totalSaved)}`
        if (activeGoalsElement) activeGoalsElement.textContent = activeGoals.toString()

        // Find next target date
        const upcomingGoals = this.savingsGoals
            .filter(goal => !goal.completed)
            .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
        
        if (nextTargetElement) {
            nextTargetElement.textContent = upcomingGoals.length > 0 ? 
                new Date(upcomingGoals[0].targetDate).toLocaleDateString() : '-'
        }
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    showMessage(message, type) {
        // Create toast notification
        const toast = document.createElement('div')
        toast.className = `toast-message ${type}`
        toast.textContent = message
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary)' : 'var(--accent)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `

        document.body.appendChild(toast)

        setTimeout(() => {
            toast.remove()
        }, 3000)
    }

    saveToLocalStorage() {
        localStorage.setItem('savingsGoals', JSON.stringify(this.savingsGoals))
    }
}

// Initialize savings manager when DOM is ready
let savingsManager
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('savingsForm')) {
        savingsManager = new SavingsManager()
    }
})
// Savings and Targets Management
class SavingsManager {
    constructor() {
        this.savingsGoals = JSON.parse(localStorage.getItem('savingsGoals')) || []
        this.init()
    }

    init() {
        this.setupEventListeners()
        this.renderGoals()
        this.updateDashboard()
    }

    setupEventListeners() {
        const form = document.getElementById('savingsForm')
        if (form) {
            form.addEventListener('submit', (e) => this.createGoal(e))
        }
    }

    createGoal(e) {
        e.preventDefault()
        
        const formData = new FormData(e.target)
        const goal = {
            id: Date.now().toString(),
            projectName: formData.get('projectName'),
            targetAmount: parseInt(formData.get('targetAmount')),
            currentAmount: parseInt(formData.get('currentAmount')),
            targetDate: formData.get('targetDate'),
            serviceType: formData.get('serviceType'),
            createdAt: new Date().toISOString(),
            completed: false
        }

        this.savingsGoals.push(goal)
        this.saveToLocalStorage()
        this.renderGoals()
        this.updateDashboard()
        e.target.reset()
        
        // Show success message
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
        const goal = this.savingsGoals.find(g => g.id === goalId)
        if (goal) {
            const newAmount = goal.currentAmount + amount
            const completed = newAmount >= goal.targetAmount
            
            this.updateGoal(goalId, {
                currentAmount: newAmount,
                completed: completed
            })

            if (completed) {
                this.showMessage(`Congratulations! You've reached your savings goal for "${goal.projectName}"`, 'success')
            }
        }
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

    showAddSavingsModal(goalId) {
        const amount = prompt('Enter amount to add (UGX):')
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
            this.addSavings(goalId, parseInt(amount))
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
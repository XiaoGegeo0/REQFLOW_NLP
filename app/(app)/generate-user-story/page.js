import StoredFeedback from '../../../components/feedback/StoredFeedback'
import { isFeedbackId } from '../../../lib/feedback'

export const metadata = { title: 'Generate User Story — REQFLOW' }

export default async function GenerateUserStoryPage({ searchParams }) {
  const { feedback } = await searchParams
  const feedbackId = isFeedbackId(feedback) ? feedback : null
  return <StoredFeedback key={feedbackId ?? 'list'} feedbackId={feedbackId} />
}

// import {tracked, cached} from './tracking'
import { MathUtils, Vector2, Vector3, Matrix4, Box3, Box2 } from './math-utils'
import { MemoizationCache } from './MemoizationCache'

export class LayoutFrustum {

    private _cache = new MemoizationCache()

    isLayoutFrustum = true

    get leftDegrees() {
        return this._leftDegrees
    }
    set leftDegrees(val:number) {
        if (val !== this._leftDegrees) {
            this._leftDegrees = val
            this._cache.invalidateAll()
        }
    }
    private _leftDegrees = -20

    get rightDegrees() {
        return this._rightDegrees
    }
    set rightDegrees(val:number) {
        if (val !== this._rightDegrees) {
            this._rightDegrees = val
            this._cache.invalidateAll()
        }
    }
    private _rightDegrees = 20

    get bottomDegrees() {
        return this._bottomDegrees
    }
    set bottomDegrees(val:number) {
        if (val !== this._bottomDegrees) {
            this._bottomDegrees = val
            this._cache.invalidateAll()
        }
    }
    private _bottomDegrees = -20

    get topDegrees() {
        return this._topDegrees
    }
    set topDegrees(val:number) {
        if (val !== this._topDegrees) {
            this._topDegrees = val
            this._cache.invalidateAll()
        }
    }
    private _topDegrees = 20

    get nearMeters() {
        return this._nearMeters
    }
    set nearMeters(val:number) {
        if (val !== this._nearMeters) {
            this._nearMeters = val
            this._cache.invalidateAll()
        }
    }
    private _nearMeters = 0.5

    get farMeters() {
        return this._farMeters
    }
    set farMeters(val:number) {
        if (val !== this._farMeters) {
            this._farMeters = val
            this._cache.invalidateAll()
        }
    }
    private _farMeters = 1000


    // get leftMeters() {
    //     return this.nearMeters * Math.abs ( Math.tan (this.leftDegrees * MathUtils.DEG2RAD) )
    // }

    // /**
    //  * The 
    //  */
    // get rightMeters() {
    //     return this.nearMeters * Math.abs ( Math.tan (this.rightDegrees * MathUtils.DEG2RAD) )
    // }

    // get bottomMeters() {
    //     return this.nearMeters * Math.abs ( Math.tan (this.bottomDegrees * MathUtils.DEG2RAD) )
    // }

    // get topMeters() {
    //     return this.nearMeters * Math.abs ( Math.tan (this.topDegrees * MathUtils.DEG2RAD) )
    // }

    get sizeDegrees() {
        this._size.set( 
            this.rightDegrees - this.leftDegrees, 
            this.topDegrees - this.bottomDegrees
        )
        return this._size
    }
    private _size = new Vector2

    /**
     * The diagonal size
     */
    get diagonalDegrees() {
        const size = this.sizeDegrees
        // pythagoras on sphere
        return Math.acos( 
            Math.cos( size.x * MathUtils.DEG2RAD ) * 
            Math.cos( size.y * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }


    /**
     * The center position 
     */
    get centerDegrees() {
        const size = this.sizeDegrees
        return this._center.set( 
            this.leftDegrees + ( size.x / 2 ), 
            this.bottomDegrees + ( size.y / 2 )
        )
    }
    private _center = new Vector2
    
    /**
     * Angular distance to the frustum center
     * (origin is the forward viewing direction). 
     * If greater than 90, the frustum is positioned
     * behind the viewer
     */
    get angleToCenter() {
        // pythagoras on sphere
        const position = this.centerDegrees
        return Math.acos( 
            Math.cos( position.x * MathUtils.DEG2RAD ) * 
            Math.cos( position.y * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }

    get angleToTopLeft() {
        return Math.acos( 
            Math.cos( this.leftDegrees * MathUtils.DEG2RAD ) * 
            Math.cos( this.topDegrees * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }

    get angleToTopRight() {
        return Math.acos( 
            Math.cos( this.rightDegrees * MathUtils.DEG2RAD ) * 
            Math.cos( this.topDegrees * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }

    get angleToBottomLeft() {
        return Math.acos( 
            Math.cos( this.leftDegrees * MathUtils.DEG2RAD ) * 
            Math.cos( this.bottomDegrees * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }

    get angleToBottomRight() {
        return Math.acos( 
            Math.cos( this.rightDegrees * MathUtils.DEG2RAD ) * 
            Math.cos( this.bottomDegrees * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }

    get angleToClosestPoint() {
        const clampedX = Math.min(Math.max(0, this.leftDegrees), this.rightDegrees)
        const clampedY = Math.min(Math.max(0, this.bottomDegrees), this.topDegrees)
        return Math.acos( 
            Math.cos( clampedX * MathUtils.DEG2RAD ) * 
            Math.cos( clampedY * MathUtils.DEG2RAD )
        ) * MathUtils.RAD2DEG
    }
    
    get angleToFarthestPoint() {
        return Math.max(
            this.angleToTopLeft, 
            this.angleToTopRight,
            this.angleToBottomLeft,
            this.angleToBottomRight
        )
    }

    /**
     * Linear depth (meters)
     */
    get depth() {
        return this.farMeters - this.nearMeters 
    }

    /**
     * Linear distance (meters) to the frustum center 
     * (origin is the viewer position).
     */
    get distance() {
        return this.nearMeters + (this.depth / 2)
    }



    get aspectRatio() {
        const near = this.nearMeters
        const left = near * Math.tan(this.leftDegrees * MathUtils.DEG2RAD)
        const right = near * Math.tan(this.rightDegrees * MathUtils.DEG2RAD)
        const top = near * Math.tan(this.topDegrees * MathUtils.DEG2RAD)
        const bottom = near * Math.tan(this.bottomDegrees * MathUtils.DEG2RAD)
        return (top - bottom) / (right - left)
    }

    private _v1 = new Vector3
    private _inverseProjection = new Matrix4
    private _forwardDirection = new Vector3(0,0,-1)
    private _fullNDC = new Box3(new Vector3(-1,-1,-1), new Vector3(1,1,1))
    
    setFromPerspectiveProjectionMatrix(projectionMatrix: Matrix4, ndcBounds:Box3=this._fullNDC) {
        const inverseProjection = this._inverseProjection.copy(projectionMatrix).invert()
        const v = this._v1
        const forward = this._forwardDirection
        const leftDegrees   = Math.sign(ndcBounds.min.x) * v.set(ndcBounds.min.x,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const rightDegrees  = Math.sign(ndcBounds.max.x) * v.set(ndcBounds.max.x,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const topDegrees    = Math.sign(ndcBounds.max.y) * v.set(0,ndcBounds.max.y,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const bottomDegrees = Math.sign(ndcBounds.min.y) * v.set(0,ndcBounds.min.y,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const nearMeters = -v.set(0,0,ndcBounds.min.z).applyMatrix4(inverseProjection).z
        const farMeters = -v.set(0,0,ndcBounds.max.z).applyMatrix4(inverseProjection).z
        this.leftDegrees = leftDegrees
        this.rightDegrees = rightDegrees
        this.topDegrees = topDegrees
        this.bottomDegrees = bottomDegrees
        this.nearMeters = nearMeters
        this.farMeters = farMeters
        return this
    }

    get perspectiveProjectionMatrix() {
        return this._cachedPerspectiveProjectionMatrix()
    }
    private _cachedPerspectiveProjectionMatrix = this._cache.memoize(() => {
        const near = this.nearMeters
        const far = this.farMeters
        const left = near * Math.tan(this.leftDegrees * MathUtils.DEG2RAD)
        const right = near * Math.tan(this.rightDegrees * MathUtils.DEG2RAD)
        const top = near * Math.tan(this.topDegrees * MathUtils.DEG2RAD)
        const bottom = near * Math.tan(this.bottomDegrees * MathUtils.DEG2RAD)
        return this._perspective.makePerspective(
            left, right,
            top, bottom,
            near, far
        )
    })
    private _perspective = new Matrix4

    overlapPercent(f:LayoutFrustum) {
        this._boxA.min.x = this.leftDegrees
        this._boxA.max.x = this.rightDegrees
        this._boxA.min.y = this.bottomDegrees
        this._boxA.max.y = this.topDegrees
        this._boxB.min.x = f.leftDegrees
        this._boxB.max.x = f.rightDegrees
        this._boxB.min.y = f.bottomDegrees
        this._boxB.max.y = f.topDegrees
        const size = this._boxA.intersect(this._boxB).getSize(this._overlapSize)
        return size.length() / this.sizeDegrees.length()
    }
    private _boxA = new Box2
    private _boxB = new Box2
    private _overlapSize = new Vector2
}